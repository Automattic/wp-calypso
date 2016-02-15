# Rubberband scroll disable

This disable "rubberband" bounce effect on OSX machines.

### Problem
On OSX, Chrome and other browsers have a specific effect of "bounce" when coming to the edge of the screen.

![](https://cldup.com/LQ7VNvnEkJ-3000x3000.png)

### Solution
This small utility library disables that effect, hooking into scroll event.

## Example
```js

import rubberBandScrollDisable from 'lib/rubberband-scroll-disable';
rubberBandScrollDisable( document.body );

```
