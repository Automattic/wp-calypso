# packaged-tour

A React tour library for generating guided tours. It carries a simple API via configuration and allows any contennt to be rendered for step and minimized views. Contains optional effects (like spotlight or overlay) that can be enabled/disabled depending on use.

## Usage

```
import { Button, Flex } from '@wordpress/components';
import { useState } from '@automattic/element';
import { previous, next, close } from '@wordpress/icons';
import Tour from '@automattic/packaged-tour';

function MyTour() {
	const [ showTour, setShowTour ] = useState( true );

	const config = {
		steps: [
			{
				referenceElements: {
					desktop: '.render-step-near-me',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			},
		],
		closeHandler: () => setShowTour( false ),
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
						<Flex justify={ 'right' }>
							<Button onClick={ onPrevious } icon={ previous } />
							<Button onClick={ onNext } icon={ next } ref={ setInitialFocusedElement } />
							<Button onClick={ onDismiss( 'close-btn' ) } icon={ close } />
						</Flex>
						<p>{ steps[ currentStepIndex ].meta.description }</p>
					</>
				);
			},
			tourMinimized: () => null,
		},
	};

	if ( ! showTour ) {
		return null;
	}

	return <PackagedTour config={ config } />;
}

```

## Accessibility

### Keyboard Navigation

The following functionality is provided to any implementation:

- Minimize or close the tour on ESC key press (depending on configuration - if a minimized step is rendered, then first press will minimize)
- Go to previous/next step on left/right arrow key press

## Config

The main API for configuring a tour. See example usage and  [types.ts](./src/types.ts) for the full definition.

`config.steps`: An array of objects that define the content we wish to render on the page. Each step defined by:

- `referenceElements` (optional): An object of deskop & mobile selectors to render the step near.
- `meta`: Arbitrary object that encloses the content we want to render in each step.

`config.closeHandler`: The function responsible for closing the tour.

`config.renderers`

- `tourStep`: A React component that will be called to render each step. Gets called with the following parameters:
  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onNext`: Handler that progresses the tour to the next step.
  - `onPrevious`: Handler that progresses the tour to the previous step.
  - `onMinimize`: Handler that minimizes the tour (passes rendering to `tourMinimized`).
  - `setInitialFocusedElement`: A dispatcher that assigns an element to be initially focused when the step renders (see example).
  - `onGoToStep`: Handler that progresses the tour to a given step index.

- `tourMinimized`: A React component that will be called to render a minimized view for the tour. Accepts the following parameters
  - `steps`: The steps defined for the tour.
  - `currentStepIndex`
  - `onDismiss`: Handler that dismissed/closes the tour.
  - `onMiximize`: Handler that expands the tour (passes rendering to `tourStep`).

    Note: setting this to `() => null` will close out the tour when either ESC is pressed or a call to `onMinimize`.

`config.options` (optional): Optional properties.

- `className`: Optional CSS class to enclose the main tour frame with.

- `effects`: An object to enable/disable/combine various tour effects:

  - `__experimental__spotlight`: Adds a semi-transparent overlay and highlights the reference element when provided with a transparent box over it.
  - `arrowIndicator`: Adds an arrow tip pointing at the rederence element when provided.
  - `overlay`: Includes the semi-transparent overlay for all the steps (also blocks interactions with the rest of the page)

- `callbacks`: An object of callbacks to handle side effects from various interactions (see [types.ts](./src/types.ts)).

- `popperModifiers`: The tour uses Popper to position steps near reference elements (and for other effects). An implementation can pass its own modifiers to tailor the functionality further e.g. more offset or padding from the reference element.

