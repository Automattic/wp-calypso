# tour-kit

A React tour library for generating configurable guided tours. Carries a minimalist setup for basic usage, but  extensible/configurable enough to accomodate more complex use cases.

We've kept the initial setup minimal with little in the way of styling (not much outside of a box-shadow for the steps and arrow indicator). Contains some optional effects (like spotlight and overlay) that can be enabled/disabled depending on desired use.

Uses [Popper.js](https://popper.js.org/) underneath (also customizable via tour configuration).

## Usage

### A tour is made up of the following components:

- A number of `steps`, made up of:
  - some arbitrary metadata
  - a set of optional reference elements selectors for rendering a step near
- Two renderers (used as render props internally):
  - a step renderer (React component/function passed a set of properties)
  - a minimized view renderer (for rendering a minimized view instead of closing)
- A close handler
- Some optional properties

See [types.ts](./src/types.ts) for the full definition of the various entities.

### A typical expected workflow builds around:

1. Define the criteria for showing a tour.
2. Define a configuration for the tour, passing along a handler for closing.
3. Render it (or not).

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
				onNext,
				onPrevious,
				onDismiss,
			} ) => {
				return (
					<>
						<button onClick={ onPrevious }>Previous</button>
						<button onClick={ onNext } ref={ setInitialFocusedElement }>Next</button>
						<button onClick={ onDismiss( 'close-btn' ) }>Close</button>
						<p>{ steps[ currentStepIndex ].meta.description }</p>
					</>
				);
			},
			tourMinimized: ...,
		},
		closeHandler: () => setShowTour( false ),
		options: ...
	};

	// 3. Render it (or not):

	if ( ! showTour ) {
		return null;
	}

	return <Tour config={ config } />;
}

```

### Examples Using [Storybook](https://storybook.js.org/)

See it in action with some basic configurations:

`yarn run tour-kit:storybook:start`

## Accessibility

### Keyboard Navigation

When a tour is rendered and focused, the following functionality exists:

- Minimize the tour on `ESC` key (in step view)
- Close the tour on `ESC` key (in minimized view)
- Go to previous/next step on `left/right` arrow keys (in step view)

## Configuration

The main API for configuring a tour is the config object. See example usage and  [types.ts](./src/types.ts) for the full definition.

`config.steps`: An array of objects that define the content we wish to render on the page. Each step defined by:

- `referenceElements` (optional): A set of `deskop` & `mobile` selectors to render the step near.
- `meta`: Arbitrary object that encloses the content we want to render for each step.

`config.closeHandler`: The callback responsible for closing the tour.

`config.renderers`:

- `tourStep`: A React component that will be called to render each step. Receives the following properties:
  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onNext`: Handler that progresses the tour to the next step.
  - `onPrevious`: Handler that takes the tour to the previous step.
  - `onMinimize`: Handler that minimizes the tour (passes rendering to `tourMinimized`).
  - `setInitialFocusedElement`: A dispatcher that assigns an element to be initially focused when a step renders (see examples).
  - `onGoToStep`: Handler that progresses the tour to a given step index.


- `tourMinimized`: A React component that will be called to render a minimized view for the tour. Receives the following properties:
  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onMiximize`: Handler that expands the tour (passes rendering to `tourStep`).

`config.options` (optional):

- `className`: Optional CSS class to enclose the main tour frame with.

- `effects`: An object to enable/disable/combine various tour effects:

  - `__experimental__spotlight`: Adds a semi-transparent overlay and highlights the reference element when provided with a transparent box over it.
  - `arrowIndicator`: Adds an arrow tip pointing at the rederence element when provided.
  - `overlay`: Includes the semi-transparent overlay for all the steps (also blocks interactions with the rest of the page)

- `callbacks`: An object of callbacks to handle side effects from various interactions (see [types.ts](./src/types.ts)).

- `popperModifiers`: The tour uses Popper to position steps near reference elements (and for other effects). An implementation can pass its own modifiers to tailor the functionality further e.g. more offset or padding from the reference element.
