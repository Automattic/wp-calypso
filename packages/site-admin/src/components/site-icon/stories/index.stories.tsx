import SiteIcon from '../';
import type { Meta, StoryFn } from '@storybook/react';
import './style.stories.scss';

/**
 * Storybook metadata
 */
const meta: Meta< typeof SiteIcon > = {
	title: 'Components/SiteIcon',
	component: SiteIcon,
	args: {
		className: '',
	},
};
export default meta;

const Template: StoryFn< typeof SiteIcon > = ( args ) => <SiteIcon { ...args } />;

export const Default = Template.bind( {} );

Default.storyName = 'SiteIcon';
Default.args = {
	className: 'story-site-icon',
};
