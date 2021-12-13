import { useState } from '@wordpress/element';
import TourKit from '.';
import type { Config } from '.';

export default { title: 'tour-kit' };

const References = () => {
	return (
		<div className={ 'storybook-tour__references' }>
			<div className={ 'storybook-tour__references-a' }>
				<p>Reference A</p>
			</div>
			<div className={ 'storybook-tour__references-b' }>
				<p>Reference B</p>
			</div>
			<div className={ 'storybook-tour__references-c' }>
				<p>Reference C</p>
			</div>
		</div>
	);
};

const Tour = ( { onClose, options }: { onClose: () => void; options?: Config[ 'options' ] } ) => {
	const config: Config = {
		steps: [
			{
				referenceElements: {
					desktop: '.storybook-tour__references-a',
					mobile: '.storybook-tour__references-a',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
				},
			},
			{
				referenceElements: {
					desktop: '.storybook-tour__references-b',
					mobile: '.storybook-tour__references-b',
				},
				meta: {
					description: 'Donec dui sapien, tincidunt eget.',
				},
			},
			{
				referenceElements: {
					desktop: '.storybook-tour__references-c',
					mobile: '.storybook-tour__references-c',
				},
				meta: {
					description: 'Suspendisse auctor varius vulputate. Nulla.',
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
					<div className="storybook-tour__step">
						<div className="storybook-tour__step-controls">
							<button onClick={ onDismiss( 'main-btn' ) }>Close</button>
							<button onClick={ onMinimize }>Minimize</button>
						</div>
						<p>{ steps[ currentStepIndex ].meta.description as string }</p>
						<div className="storybook-tour__step-controls">
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
					<div className="storybook-tour__step">
						<div className="storybook-tour__step-controls">
							<button onClick={ onDismiss( 'main-btn' ) }>Close</button>
							<button onClick={ onMaximize }>Miximize</button>
						</div>
					</div>
				);
			},
		},
		closeHandler: onClose,
		options: {
			className: 'storybook-tour',
			...options,
		},
	};

	return <TourKit config={ config } />;
};
const StoryTour = ( { options = {} }: { options?: Config[ 'options' ] } ) => {
	const [ showTour, setShowTour ] = useState( false );

	return (
		<>
			<References />
			{ ! showTour && <button onClick={ () => setShowTour( true ) }>Start Tour</button> }
			{ showTour && <Tour onClose={ () => setShowTour( false ) } options={ options } /> }
		</>
	);
};

export const Default = (): JSX.Element => <StoryTour />;
export const Overlay = (): JSX.Element => <StoryTour options={ { effects: { overlay: true } } } />;
export const Spotlight__Experimental = (): JSX.Element => (
	<StoryTour options={ { effects: { __experimental__spotlight: true } } } />
);
