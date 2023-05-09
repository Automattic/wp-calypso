import { useState } from '@wordpress/element';
import WpcomTourKit from '..';
import type { WpcomConfig, WpcomOptions } from '../../..';

export default { title: 'wpcom-tour-kit' };

const References = () => {
	return (
		<div className="storybook__tourkit-references">
			<div className="storybook__tourkit-references-container">
				<div className="storybook__tourkit-references-a">
					<p>Reference A</p>
				</div>
				<div className="storybook__tourkit-references-b">
					<p>Reference B</p>
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

const Tour = ( { onClose, options }: { onClose: () => void; options?: WpcomOptions } ) => {
	const config: WpcomConfig = {
		steps: [
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-a',
					mobile: '.storybook__tourkit-references-a',
				},
				meta: {
					heading: 'Laura 1',
					descriptions: {
						desktop: 'Lorem ipsum dolor sit amet.',
						mobile: 'Lorem ipsum dolor sit amet.',
					},
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-b',
					mobile: '.storybook__tourkit-references-b',
				},
				meta: {
					heading: 'Laura 2',
					descriptions: {
						desktop: 'Lorem ipsum dolor sit amet.',
						mobile: 'Lorem ipsum dolor sit amet.',
					},
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-c',
					mobile: '.storybook__tourkit-references-c',
				},
				meta: {
					heading: 'Laura 3',
					descriptions: {
						desktop: 'Lorem ipsum dolor sit amet.',
						mobile: 'Lorem ipsum dolor sit amet.',
					},
				},
			},
			{
				referenceElements: {
					desktop: '.storybook__tourkit-references-d',
					mobile: '.storybook__tourkit-references-d',
				},
				meta: {
					heading: 'Laura 4',
					descriptions: {
						desktop: 'Lorem ipsum dolor sit amet.',
						mobile: 'Lorem ipsum dolor sit amet.',
					},
				},
			},
		],
		closeHandler: onClose,
		options: {
			classNames: [ 'mytour' ],
			...options,
		},
	};

	return <WpcomTourKit config={ config } />;
};

const StoryTour = ( { options = {} }: { options?: WpcomOptions } ) => {
	const [ showTour, setShowTour ] = useState( false );

	return (
		<div className="storybook__tourkit">
			<References />
			{ ! showTour && <button onClick={ () => setShowTour( true ) }>Start Tour</button> }
			{ showTour && <Tour onClose={ () => setShowTour( false ) } options={ options } /> }
		</div>
	);
};

export const DefaultWithRating = () => (
	<StoryTour options={ { effects: { arrowIndicator: false }, tourRating: { enabled: true } } } />
);
export const SpotlightWithRating = () => (
	<StoryTour
		options={ { effects: { spotlight: {}, arrowIndicator: false }, tourRating: { enabled: true } } }
	/>
);
