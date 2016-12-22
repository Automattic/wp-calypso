# Guided Tours API

Guided Tours are declared in JSX as a tree of elements. All of them are available as named exports from `client/layout/guided-tours/config-elements`.

## All-in example

Before we go into full details, let's look at this example. It includes most possible things you can use.

<img src="https://cldup.com/QBoRhc-P0M.png" width="515" />

Here is the code used:

```
<Step name="example" placement="below" target="my-sites" arrow="top-left">
  <p>Plain text description.</p>
  <p>Multiple lines.</p>
  <Continue step="next-step" click target="my-sites" icon="my-sites" />
  <ButtonRow>
    <Next step="next-step" />
    <Quit />
  </ButtonRow>
  <Link href="https://learn.wordpress.com">
    { translate( 'Learn more about WordPress.com' ) }
  </Link>
</Step>
```

## Tour

Tour is a React component that declares the top-level of a tour. It defines conditions for starting a tour and contains `<Step>` elements as children.

### Props

* `name`: (string) Unique name of tour in camelCase.
* `version` (string): Version identifier. We use date string like "20161224".
* `path` (string or array, optional): Use this prop to limit tour only to some path prefix (or more prefixes if array). Example: `[ '/stats', '/settings' ]`
* `when` (function, optional): This is a redux selector function. Use this to define conditions for the tour to start.
* `children` (nodes): only supported type is `<Step>`

## Step

Step is a React component that defines a single Step of a tour. It is represented as dark box on top of Calypso UI. Step can be positioned in many ways in relation to any DOM node in Calypso that is marked with `[data-tip-target]` attribute.

### Props

* `name`: (string) Unique identifier of the step.
* `target`: (string, optional) Target which this step belongs to and will be used for positioning. Value of this prop is used to look up according `[data-tip-target]` in DOM. If you start this value with `.` (dot), it will be evaluated as a query selector, so you can select elements that have no `[data-tip-target]` defined.
* `placement`: (string, optional) Placement. Possible values: 'below', 'above', 'beside', 'center', 'middle', 'right'
* `arrow`: (string, optional) If defined, step will get arrow pointing to a direction. Available: 'top-left', 'top-center', 'top-right',
'right-top', 'right-middle', 'right-bottom', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-middle', 'left-bottom'
* `style`: (object, optional) Will be used as step's inline style. Use sparingly and with caution for minor tweaks in positioning or z-indexes and avoid changing the look and feel of Guided Tours. If you use this is a way that could benefit all Guided Tours globally, please consider creating an issue.
* `when`: (function, optional) This is a redux selector that can prevent step from showing when it evaluates to false. Define `next` prop to tell Guided Tours name of the step it should skip to. If you omit this prop, step will be rendered as expected.
* `next`: (string, optional) Define this to tell Guided Tours name of the step it should skip to when `when` evaluates to false.
* `children`: (nodes) Content of step. Usually a paragraph of instructions and some controls for tour. See below for available options.

### Example

```jsx
// single step tour
<Tour path="/me" name="uselessTour">
  <Step>
    <p>This is a page about you.</p>
    <ButtonRow>
      <Quit />
    </ButtonRow>
  </Step>
</Tour>
```

Note that all text content needs to be wrapped in `<p>` so it gets proper styling.

For more comprehensive examples, look at [TUTORIAL.md](TUTORIAL.md) or explore existing tours in client/layout/guided-tours/tours.

## ButtonRow

ButtonRow is a React component to display button controls in Step and takes care of their proper styling. Usually used as the last child of Step to contain all available controls.

### Example

```jsx
<Step>
  <p>ButtonRow Example</p>
  <ButtonRow>
    <Next step="next-step" />
    <Quit />
  </ButtonRow>
</Step>
```

## Continue

Continue is a React component that you can use in Step to programmatically continue the tour to other step based on user interaction with Calypso.

### Props

* `step`: (string) Name of the step the tour will advance to.
* `target`: (string, optional) Name of `[data-tip-target]` that would be watched.
* `click`: (bool, optional) If true, `onClick` will be listened on `target` DOM node.
* `hidden`: (bool, optional) If true, this will not render anything in Step, while functionality remains.
* `icon`: (string, optional) Name of Gridicon to show in custom message.
* `when`: (function, optional) Redux selector. Once it evaluates to true, tour will advance to `step`.
* `children`: (nodes, optional) If you provide children, it will override the default content.

### Visual Options

There are three ways to define a content of this component.

- default text is "Click to continue." Use just as `<Continue … />` with no children.
- default text + Gridicon ("Click *icon* to continue.") - provide name of Gridicon as an `icon` prop. Example: `<Continue icon="my-sites" … />`
- custom content - provide it as children: `<Continue …>My Content</Continue>`

### Functionality Options

There are currently two ways to declare the condition to continue the tour.

- Binding an `onClick` listener to a DOM node marked as `[data-tip-target]`
- Redux selector function that evaluates to true in order to advance the tour

```jsx
// continue when user clicks DOM element with html attribute `data-tip-target="my-sites"`
<Continue step="next-step" click target="my-sites" />

// continue when Redux selector evaluates to true (in this case after the user opens a preview)
<Continue step="next-step" when={ isPreviewShowing } />
```

## Next

Link is a React component that shows a button that allows users to advance tour to another step. To be used inside of `<ButtonRow>`.

### Props

* `step`: (string) Name of the step the tour will advance to.

### Label

Default label is "Next". To override, place your label as a child.

### Example

```jsx
// with default label
<Next step="next-step" />

// or with a custom one
<Next step="next-step">{ translate( 'Custom Label' ) }</Next>`
```

## Quit

Quit is a React component that shows a button that allows users to quit current tour. To be used inside of `<ButtonRow>`.

### Props

* `primary` (bool, optional) If true, button will be rendered as primary. Use only if Quit is the only available action in that step.

### Label

Default label is "Quit". To override, place your label a child.

### Example

```jsx
// with a default label "Quit"
<Quit />

// with a custom label
<Quit>{ translate( 'Custom Label' ) }</Quit>`

// custom label + primary styling
<Quit primary>{ translate( 'Custom Label' ) }</Quit>`
```

## Link

Link is a React component that shows a Link to external page in Step. It takes care of the styling and makes sure the link always opens in a new browser tab. We usually use it in the last step of tour where we nudge user to explore the docs to learn more about the area we just covered with a tour.

Place Link after ButtonRow (if present) for correct styling.

### Example

```
// last step of tour with option to quit or visit learn.wordpress.com
<Step>
  <p>This is the last step!</p>
  <ButtonRow>
    <Quit />
  </ButtonRow>
  <Link href="https://learn.wordpress.com">
    { translate( 'Learn more about WordPress.com' ) }
  </Link>
</Step>
```
