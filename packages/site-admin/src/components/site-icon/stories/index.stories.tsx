import { SiteIcon } from '../';
import './style.stories.scss';
import type { Meta, StoryFn } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof SiteIcon > = {
	title: 'Components/SiteIcon',
	component: SiteIcon,
};

export default meta;

export const Default: StoryFn< typeof SiteIcon > = SiteIcon.bind( {} );
Default.args = {
	className: 'custom-icon-styles',
};
