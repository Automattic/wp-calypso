# packaged-tour

Everything under here to be extracted to `/packages` as a standalone react-tour lib for npm.

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

## Configuration

### steps

### closeHandler

### renderers

### options

#### effects

#### ...
