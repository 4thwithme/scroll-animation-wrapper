import React, { useState, useEffect, useRef } from "react";
import { throttle } from "lodash";

type Callback = (...args: unknown[]) => void;

interface IVisibility {
  onScreen: boolean;
  inViewport: boolean;
}
interface IArgs {
  animateIn: string;
  animateOut: string;
  offset: number;
  duration: number;
  delay: number;
  initiallyVisible: boolean;
  animateOnce: boolean;
  style?: { [key: string]: unknown };
  scrollableParentSelector?: string;
  className?: string;
  animatePreScroll?: boolean;
  afterAnimatedIn?: Callback;
  afterAnimatedOut?: Callback;
  children: React.ReactNode;
}

export const ScrollAnimation = ({
  animateIn: animateInStr,
  animateOut: animateOutStr,
  afterAnimatedIn,
  afterAnimatedOut,
  offset = 150,
  duration = 1,
  delay = 0,
  initiallyVisible = false,
  animateOnce = false,
  style,
  scrollableParentSelector,
  className,
  animatePreScroll = true,
  children,
}: IArgs) => {
  const [state, setState] = useState<{
    classes: string;
    style: { [key: string]: unknown };
  }>({
    classes: "animated",
    style: {
      animationDuration: `${duration}s`,
      opacity: initiallyVisible ? 1 : 0,
    },
  });

  let animating = false;
  let delayedAnimationTimeout: ReturnType<typeof setTimeout>;
  let callbackTimeout: ReturnType<typeof setTimeout>;
  let scrollableParent: Element | null | (Window & typeof globalThis);
  const nodeRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  const handleScroll = (): void => {
    if (!animating) {
      const currentVis = getVisibility();
      if (visibilityHasChanged(visibility, currentVis)) {
        clearTimeout(delayedAnimationTimeout);
        if (!currentVis.onScreen) {
          setState({
            classes: "animated",
            style: {
              animationDuration: `${duration}s`,
              opacity: initiallyVisible ? 1 : 0,
            },
          });
        } else if (currentVis.inViewport && animateIn) {
          animateIn(afterAnimatedIn);
        } else if (
          currentVis.onScreen &&
          visibility.inViewport &&
          animateOut &&
          state.style.opacity === 1
        ) {
          animateOut(afterAnimatedOut);
        }
        visibility = currentVis;
      }
    }
  };

  const listener = throttle(handleScroll, 50);
  let visibility: IVisibility = {
    onScreen: false,
    inViewport: false,
  };

  const classes = className ? `${className} ${state.classes}` : state.classes;

  const getElementTop = (elm: any): number => {
    let yPos = 0;
    while (elm && elm.offsetTop !== undefined && elm.clientTop !== undefined) {
      yPos += elm.offsetTop + elm.clientTop;
      elm = elm.offsetParent;
    }
    return yPos;
  };

  const getScrollPos = (): number => {
    if (
      (scrollableParent as Window & typeof globalThis)?.pageYOffset !==
      undefined
    ) {
      return (scrollableParent as Window & typeof globalThis).pageYOffset;
    }
    return (scrollableParent as Element)?.scrollTop;
  };

  const getScrollableParentHeight = (): number => {
    if ((scrollableParent as Window & typeof globalThis)?.innerHeight) {
      return (scrollableParent as Window & typeof globalThis).innerHeight;
    }
    return (scrollableParent as Element).clientHeight;
  };

  const getViewportTop = (): number => {
    return getScrollPos() + offset;
  };

  const getViewportBottom = (): number => {
    return getScrollPos() + getScrollableParentHeight() - offset;
  };

  const isInViewport = (y: number): boolean => {
    return y >= getViewportTop() && y <= getViewportBottom();
  };

  const isAboveViewport = (y: number): boolean => {
    return y < getViewportTop();
  };

  const isBelowViewport = (y: number): boolean => {
    return y > getViewportBottom();
  };

  const inViewport = (elementTop: number, elementBottom: number): boolean => {
    return (
      isInViewport(elementTop) ||
      isInViewport(elementBottom) ||
      (isAboveViewport(elementTop) && isBelowViewport(elementBottom))
    );
  };

  const onScreen = (elementTop: number): boolean => !isBelowScreen(elementTop);
  const isBelowScreen = (y: number): boolean =>
    y > getScrollPos() + getScrollableParentHeight();
  const getVisibility = (): IVisibility => {
    const elementTop =
      getElementTop(nodeRef.current) - getElementTop(scrollableParent);
    const elementBottom = elementTop + (nodeRef?.current?.clientHeight ?? 0);
    return {
      inViewport: inViewport(elementTop, elementBottom),
      onScreen: onScreen(elementTop),
    };
  };

  useEffect(() => {
    const parentSelector = scrollableParentSelector;
    scrollableParent = parentSelector
      ? document.querySelector(parentSelector)
      : window;
    if (scrollableParent && scrollableParent.addEventListener) {
      scrollableParent.addEventListener("scroll", listener);
    }

    if (animatePreScroll) {
      handleScroll();
    }

    return () => {
      clearTimeout(delayedAnimationTimeout);
      clearTimeout(callbackTimeout);
      if (window && window.removeEventListener) {
        window.removeEventListener("scroll", listener);
      }
    };
  }, []);

  const visibilityHasChanged = (
    previousVis: IVisibility,
    currentVis: IVisibility
  ): boolean => {
    return (
      previousVis.inViewport !== currentVis.inViewport ||
      previousVis.onScreen !== currentVis.onScreen
    );
  };

  const animate = (animation: string, callback: Callback): void => {
    delayedAnimationTimeout = setTimeout(() => {
      animating = true;
      setState({
        classes: `animated ${animation}`,
        style: {
          animationDuration: `${duration}s`,
        },
      });
      callbackTimeout = setTimeout(callback, duration * 1000);
    }, delay);
  };

  const animateIn = (callback?: Callback): void => {
    animate(animateInStr, () => {
      if (!animateOnce) {
        setState((prev) => ({
          ...prev,
          style: {
            animationDuration: `${duration}s`,
            opacity: 1,
          },
        }));

        animating = false;
      }
      const vis = getVisibility();
      if (callback) {
        callback(vis);
      }
    });
  };

  const animateOut = (callback?: Callback): void => {
    animate(animateOutStr, () => {
      setState({
        classes: "animated",
        style: {
          animationDuration: `${duration}s`,
          opacity: 0,
        },
      });
      const vis = getVisibility();
      if (vis.inViewport && animateIn) {
        animateIn(afterAnimatedIn);
      } else {
        animating = false;
      }

      if (callback) {
        callback(vis);
      }
    });
  };

  return (
    <div ref={nodeRef} className={classes} style={{ ...state.style, ...style }}>
      {children}
    </div>
  );
};

export default ScrollAnimation;
