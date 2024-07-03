import { useState } from '@wordpress/element';
import TourKit from '..';
import type { Config } from '..';

export default { title: 'tour-kit' };

const References = () => {
	return (
		<div className="storybook__tourkit-references">
			<div className="storybook__tourkit-references-container">
				<div
					style={ { resize: 'both', overflow: 'auto' } }
					className="storybook__tourkit-references-a"
				>
					<p>Reference A</p>
				</div>
				<div className="storybook__tourkit-references-b">
					<p>Reference B</p>
					<div style={ { display: 'grid', placeItems: 'center' } }>
						<input style={ { margin: 'auto', display: 'block' } }></input>
					</div>
				</div>
				<div className="storybook__tourkit-references-c">
					<p>Reference C</p>
				</div>
				<div className="storybook__tourkit-references-d">
					<p>Reference D</p>
				</div>
			</div>
		</div>
	);
};

const Tour = ( {
	onClose,
	options,
	placement,
}: {
	onClose: () => void;
	options?: Config[ 'options' ];
	placement?: Config[ 'placement' ];
} ) => {
	const config: Config = {
		placement: placement || 'bottom',
		steps: [
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-a',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-b',
					mobile: '.storybook__tourkit-references-b',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-c',
					mobile: '.storybook__tourkit-references-c',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet.',
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-d',
					mobile: '.storybook__tourkit-references-d',
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
				onNextStep,
				onDismiss,
				onPreviousStep,
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
							<button onClick={ onNextStep } ref={ setInitialFocusedElement }>
								Next
							</button>
							<button onClick={ onPreviousStep }>Previous</button>
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

const StoryTour = ( {
	options = {},
	placement,
}: {
	options?: Config[ 'options' ];
	placement?: Config[ 'placement' ];
} ) => {
	const [ showTour, setShowTour ] = useState( false );

	return (
		<div className="storybook__tourkit">
			<References />
			{ ! showTour && <button onClick={ () => setShowTour( true ) }>Start Tour</button> }
			{ showTour && (
				<Tour onClose={ () => setShowTour( false ) } options={ options } placement={ placement } />
			) }
		</div>
	);
};

export const Default = () => <StoryTour />;
export const Overlay = () => <StoryTour options={ { effects: { overlay: true } } } />;
export const Spotlight = () => <StoryTour options={ { effects: { spotlight: {} } } } />;
export const SpotlightInteractivity = () => (
	<StoryTour
		options={ {
			effects: { spotlight: { interactivity: { rootElementSelector: '#root', enabled: true } } },
		} }
	/>
);
export const SpotlightInteractivityWithAutoResize = () => (
	<StoryTour
		options={ {
			effects: {
				spotlight: { interactivity: { rootElementSelector: '#root', enabled: true } },
				liveResize: { mutation: true, resize: true, rootElementSelector: '#root' },
			},
		} }
	/>
);
export const AutoScroll = () => (
	<>
		<div style={ { height: '10vh' } }></div>
		<StoryTour
			options={ {
				effects: {
					autoScroll: {
						behavior: 'smooth',
					},
				},
			} }
		/>
	</>
);

export const Placement = () => <StoryTour placement="left" />;
