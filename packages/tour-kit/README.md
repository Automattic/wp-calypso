# tour-kit

A React tour library for configurable guided tours. Carries a minimalist setup for basic usage, but extensible/configurable enough to accomodate more complex use cases.

We've kept the initial setup minimal with little in the way of styling (not much outside of a box-shadow for the steps and arrow indicator). Contains some optional effects (like spotlight and overlay) that can be enabled/disabled depending on desired use. Variant implementations are also included, which provide more styled versions of the main views.

Uses [Popper.js](https://popper.js.org/) underneath (also customizable via tour configuration).

## Variants

Variants are ready implementations of Tour Kit providing styled variations of the two main views (expanded and minimized).

### WPCOM Tour Kit

This is a variant extracted from the guided tours in WordPress.com. It provides the two main renderers (step and minimized views) with controls for navigating, minimizing, and closing. Comes with optional rating in the last step and pagination controls.

(see usage and examples below)

## Usage

A tour is made up of the following components:

- A number of `steps`, made up of:
  - some arbitrary metadata
  - a set of optional reference elements selectors for rendering a step near
  - a set of options:
  - classNames: optional custom CSS classes that will be applied to the step
- Two renderers (used as render props internally):
  - a step renderer (React component/function passed a set of properties)
  - a minimized view renderer (for rendering a minimized view instead of closing)
- A close handler
- A boolean to minimize the tour
- Some optional properties

See [types.ts](./src/types.ts) for the full definition of the various entities.

A typical expected workflow builds around:

1. Define the criteria for showing a tour.
2. Define a configuration for the tour, passing along a handler for closing.
3. Render it (or not).

**Note:** For the WPCOM Tour Kit variant, the two renderers are omitted.

### Sample

```jsx
import Tour from '@automattic/tour-kit';

function FooBar() {
	// 1. Define the criteria for showing a tour:
	const [ showTour, setShowTour ] = useState( true );

	// 2. Define a configuration for the tour, passing along a handler for closing.
	const config = {
		steps: [
			{
				referenceElements: {
					desktop: '.render-step-near-me',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
				},
			},
		],
		renderers: {
			tourStep: ( {
				steps,
				currentStepIndex,
				setInitialFocusedElement,
				onNextStep,
				onPreviousStep,
				onDismiss,
			} ) => {
				return (
					<>
						<button onClick={ onPreviousStep }>Previous</button>
						<button onClick={ onNextStep } ref={ setInitialFocusedElement }>
							Next
						</button>
						<button onClick={ onDismiss( 'close-btn' ) }>Close</button>
						<p>{ steps[ currentStepIndex ].meta.description }</p>
					</>
				);
			},
			tourMinimized: <div />,
		},
		closeHandler: () => setShowTour( false ),
		options: {},
	};

	// 3. Render it (or not):

	if ( ! showTour ) {
		return null;
	}

	return <Tour config={ config } />;
}
```

**Note:** If using the `WpcomTourKit` component, please note that it uses generic [@wordpress/components](https://www.npmjs.com/package/@wordpress/components) to render the controls, which require a stylesheet to be imported in the app (either as a dependency or imported directly in non-WordPress projects). See the Storybook demos below for example use.

### Examples Using [Storybook](https://storybook.js.org/)

See it in action with some basic configurations (includes both the plain Tour Kit and the WPCOM Tour Kit variant):

`yarn workspace @automattic/tour-kit run storybook`

## Accessibility

### Keyboard Navigation

When a tour is rendered and focused, the following functionality exists:

- Minimize the tour on `ESC` key (in step view)
- Close the tour on `ESC` key (in minimized view)
- Go to previous/next step on `left/right` arrow keys (in step view)

## Configuration

The main API for configuring a tour is the config object. See example usage and [types.ts](./src/types.ts) for the full definition.

`config.steps`: An array of objects that define the content we wish to render on the page. Each step defined by:

- `referenceElements` (optional): A set of `desktop` & `mobile` selectors to render the step near.
- `meta`: Arbitrary object that encloses the content we want to render for each step.
- `classNames` (optional): An array or CSV of CSS classes applied to a step.

`config.closeHandler`: The callback responsible for closing the tour.

`config.isMinimized`: The optional boolean value responsible for minimizing the tour.

`config.renderers` (omitted in the WPCOM Tour Kit variant):

- `tourStep`: A React component that will be called to render each step. Receives the following properties:

  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onNextStep`: Handler that progresses the tour to the next step.
  - `onPreviousStep`: Handler that takes the tour to the previous step.
  - `onMinimize`: Handler that minimizes the tour (passes rendering to `tourMinimized`).
  - `setInitialFocusedElement`: A dispatcher that assigns an element to be initially focused when a step renders (see examples).
  - `onGoToStep`: Handler that progresses the tour to a given step index.

- `tourMinimized`: A React component that will be called to render a minimized view for the tour. Receives the following properties:
  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onMaximize`: Handler that expands the tour (passes rendering to `tourStep`).

`config.options` (optional):

- `classNames` (optional): An array or CSV of CSS classes to enclose the main tour frame with.

- `effects`: An object to enable/disable/combine various tour effects:

  - `spotlight`: Adds a semi-transparent overlay and highlights the reference element when provided with a transparent box over it. Expects an object with optional styles to override the default highlight/spotlight behavior when provided (default: spotlight wraps the entire reference element).
    - `interactivity`: An object that configures whether the user is allowed to interact with the referenced element during the tour
    - `styles`: CSS properties that configures the styles applied to the spotlight overlay
  - `arrowIndicator`: Adds an arrow tip pointing at the reference element when provided.
  - `overlay`: Includes the semi-transparent overlay for all the steps (also blocks interactions with the rest of the page)
  - `autoScroll`: The page scrolls up and down automatically such that the step target element is visible to the user.
  - `liveResize`: Configures the behaviour for automatically resizing the tour kit elements (TourKitFrame and Spotlight). Defaults to disabled.

- `callbacks`: An object of callbacks to handle side effects from various interactions (see [types.ts](./src/types.ts)).

- `popperModifiers`: The tour uses Popper to position steps near reference elements (and for other effects). An implementation can pass its own modifiers to tailor the functionality further e.g. more offset or padding from the reference element.
- `tourRating` (optional - only in WPCOM Tour Kit variant):

  - `enabled`: Whether to show rating in last step.
  - `useTourRating`: (optional) A hook to provide the rating from an external source/state (see [types.ts](./src/types.ts)).
  - `onTourRate`: (optional) A callback to fire off when a rating is submitted.

- `portalElementId`: A string that lets you customize under which DOM element the Tour will be appended.

`placement` (Optional) : Describes the preferred placement of the popper. Possible values are left-start, left, left-end, top-start, top, top-end, right-start, right, right-end, bottom-start, bottom, and bottom-end.
