import { Story, Meta } from '@storybook/react';
import AutomatticLogo from './index';

export default {
	title: 'client/components/AutomatticLogo',
	component: AutomatticLogo,
} as Meta;

const Template: Story = ( args ) => <AutomatticLogo { ...args } />;

export const Default = Template.bind( {} );
Default.args = {};
