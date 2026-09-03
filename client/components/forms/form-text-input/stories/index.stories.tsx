import FormTextInput from '../index';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';

export type FormTextInputStory = StoryObj< typeof FormTextInput >;

const meta: Meta = {
	title: 'client/components/Forms/Form Text Input',
	component: FormTextInput,
	decorators: [
		( Story: ComponentType ) => (
			<div style={ { maxWidth: '360px', padding: '30px' } }>
				<Story />
			</div>
		),
	],
};

export default meta;

export const Default: FormTextInputStory = {};

export const CoreStyles: FormTextInputStory = { args: { hasCoreStyles: true } };

export const CoreStylesValid: FormTextInputStory = {
	args: { hasCoreStyles: true, className: 'is-valid' },
};

export const CoreStylesError: FormTextInputStory = {
	args: { hasCoreStyles: true, className: 'is-error' },
};
