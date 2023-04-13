import { Story, Meta } from '@storybook/react';
import { TextDisplay, TextDisplayProps } from './sample';

export default {
	title: 'Example/TextDisplay',
	component: TextDisplay,
} as Meta;

const Template: Story< TextDisplayProps > = ( args ) => <TextDisplay { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	text: 'Sample text to display',
};

export const CustomClass = Template.bind( {} );
CustomClass.args = {
	text: 'Text with custom class',
	className: 'custom-class',
};
