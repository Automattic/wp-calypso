# New Component Checklist

Component QA is used whenever someone wants to merge a new component to the system. The steps below are from Nathan Curtis’ Component QA article and work more as a guideline.

1. Visual Quality

Does the component apply visual style — color, typography, icons, space, borders, and more — using appropriate variables, and does it meet our visual guidelines?

2. Sufficient States & Variations

Does it cover all the necessary variations (primary, secondary, flat, menu button) and states (default, hover, active, disabled), given intended scope?

3. Responsiveness

Does it incorporate responsive display patterns and behaviors as needed?

4. Content Resilience

Is each dynamic word or image element resilient to too much, too little, and no content at all, respectively? For tabs, how long can labels be, and what happens when you run out of space?

5. Composability

Does it fit well when placed next to or layered with other components to form a larger composition? For tabs, how can they be applied stacked with or on top of other components?

6. Functionality

Do all behaviors – typically, JavaScript-driven – function as expected? For responsive tabs, are gestures (for sliding left and right) and menus (for overflow tabs) behaving correctly in varied device settings?

7. Accessibility

Has the design and implementation accounted for accessible?

8. Browsers Compatibility

Has the component visual quality and accuracy been assessed across Safari, Chrome, Firefox, IE and other browsers across relevant devices?