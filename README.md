# Wrapper for animation onScroll

## Install

```shell
npm i react-scroll-animation-wrapper --save
```

## Most Simple Use:

```
import ScrollAnimation from 'react-scroll-animation-wrapper';
<ScrollAnimation animateIn="fadeIn">
  Some Text
</ScrollAnimation>
```

## Properties:

**offset** - default 150

The "viewport" is by default 150 pixels from the top and bottom of the screen. When part of an element is within the "viewport", animateIn is triggered. When no part of the element is in the "viewport", animateOut is triggered. This size of the "viewport" can be overridden by setting the offset property.

**animateIn**

Any css animation defined against a class.

**animateOut**

Any css animation defined against a class.

**duration** - default 1

Animation duration in seconds.

**initiallyVisible** - default false

Whether the element should be visible to begin with or not.

**delay** - default 0

How long to delay the animation for (in milliseconds) once it enters or leaves the view.

**animateOnce** - default false

Whether the element should only animate once or not.

**style** - default {}

A style object can be assigned to any ScrollAnimation component and will be passed to the rendered dom element. Its probably best to avoid manually setting animationDuration or opacity as the component will modify those attributes.

**scrollableParentSelector**

By default the code checks to see if the element is visible within the window. This can be changed to any other parent element of the ScrollAnimation by adding a css selector pointing to the parent that you wish to use.

**afterAnimatedIn**

Callback function to run once the animateIn animation has completed. Receives the visibility of the element at time of execution.
Example:

```
function(visible) {
  if (visible.inViewport) {
    // Part of the element is in the viewport (the area defined by the offset property)
  } else if (visible.onScreen) {
    // Part of the element is visible on the screen
  } else {
    // Element is no longer visible
  }
}
```

**afterAnimatedOut**

Callback function to run once the animateOut animation has completed. Receives the visibility of the element at time of execution.
Example:

```
function(visible) {
  if (visible.inViewport) {
    // Part of the element is in the viewport (the area defined by the offset property)
  } else if (visible.onScreen) {
    // Part of the element is visible on the screen
  } else {
    // Element is no longer visible
  }
}
```

**animatePreScroll** - default true

By default if a ScrollAnimation is in view as soon as a page loads, then the animation will begin. If you don't want the animation to being until the user scrolls, then set this to false.

**className**

Class name string witch will bw added to current css class string if present

**animateOnlyOnScrollDown**
start animation only on scrolling down

## License

MIT
