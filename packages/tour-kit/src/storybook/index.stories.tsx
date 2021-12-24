/* eslint-disable wpcalypso/jsx-classname-namespace */

import { useState } from '@wordpress/element';
import TourKit from '..';
import type { Config } from '..';

export default { title: 'tour-kit' };

const References = () => {
	return (
		<div className={ 'storybook__tourkit-references' }>
			<div className={ 'storybook__tourkit-references-container' }>
				<div className={ 'storybook__tourkit-references-a' }>
					<p>Reference A</p>
				</div>
				<div className={ 'storybook__tourkit-references-b' }>
					<p>Reference B</p>
				</div>
				<div className={ 'storybook__tourkit-references-c' }>
					<p>Reference C</p>
				</div>
				<div className={ 'storybook__tourkit-references-d' }>
					<p>Reference D</p>
				</div>
			</div>
		</div>
	);
};

const Tour = ( { onClose, options }: { onClose: () => void; options?: Config[ 'options' ] } ) => {
	const config: Config = {
		steps: [
			{
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
					referenceElements: {
						desktop: '.storybook-tour__references-a',
						mobile: '.storybook-tour__references-a',
					},
				},
			},
			{
				meta: {
					description: 'Donec dui sapien, tincidunt eget.',
					referenceElements: {
						desktop: '.storybook-tour__references-b',
						mobile: '.storybook-tour__references-b',
					},
				},
			},
			{
				meta: {
					description: 'Suspendisse auctor varius vulputate. Nulla.',
					referenceElements: {
						desktop: '.storybook-tour__references-c',
						mobile: '.storybook-tour__references-c',
					},
				},
			},
		],
		renderers: {
			tourStep: ( {
				steps,
				currentStepIndex,
				onNext,
				onDismiss,
				onPrevious,
				onMinimize,
				setInitialFocusedElement,
			} ) => {
				return (
					<div className="storybook__tourkit-step">
						<div className="storybook__tourkit-step-controls">
							<button onClick={ onDismiss( 'main-btn' ) }>Close</button>
							<button onClick={ onMinimize }>Minimize</button>
						</div>
						<p>{ `${
							steps[ currentStepIndex ].meta.description as string
						} (${ currentStepIndex })` }</p>
						<div className="storybook__tourkit-step-controls">
							<button onClick={ onNext } ref={ setInitialFocusedElement }>
								Next
							</button>
							<button onClick={ onPrevious }>Previous</button>
						</div>
					</div>
				);
			},
			tourMinimized: ( { onMaximize, onDismiss } ) => {
				return (
					<div className="storybook__tourkit-minimized">
						<div className="storybook__tourkit-minimized-controls">
							<button onClick={ onDismiss( 'main-btn' ) }>Close</button>
							<button onClick={ onMaximize }>Maximize</button>
						</div>
					</div>
				);
			},
		},
		closeHandler: onClose,
		options: {
			classNames: [ 'mytour' ],
			...options,
		},
	};

	return <TourKit config={ config } />;
};

const StoryTour = ( { options = {} }: { options?: Config[ 'options' ] } ) => {
	const [ showTour, setShowTour ] = useState( false );

	return (
		<div className="storybook__tourkit">
			<References />
			{ ! showTour && <button onClick={ () => setShowTour( true ) }>Start Tour</button> }
			{ showTour && <Tour onClose={ () => setShowTour( false ) } options={ options } /> }
		</div>
	);
};

export const Default = (): JSX.Element => <StoryTour />;
export const Overlay = (): JSX.Element => <StoryTour options={ { effects: { overlay: true } } } />;
export const Spotlight = (): JSX.Element => (
	<StoryTour options={ { effects: { spotlight: {} } } } />
);
