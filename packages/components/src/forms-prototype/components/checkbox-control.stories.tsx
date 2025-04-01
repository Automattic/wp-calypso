import { useState } from 'react';
import { ValidatedCheckboxControl } from './checkbox-control';
import { formDecorator } from './story-utils';
import type { StoryObj, Meta } from '@storybook/react';

const meta: Meta = {
	title: 'Packages/Components/Validated Form Controls/ValidatedCheckboxControl',
	component: ValidatedCheckboxControl,
	decorators: formDecorator,
	argTypes: {
		// TODO: Figure out why this deprecated prop is still showing up here and not in the WP Storybook.
		heading: { table: { disable: true } },
	},
};
export default meta;

export const Default: StoryObj = {
	render: function Template() {
		const [ checked, setChecked ] = useState( false );

		return (
			<ValidatedCheckboxControl
				required
				label="Checkbox"
				help="This checkbox may neither be checked nor unchecked."
				checked={ checked }
				onChange={ setChecked }
				onReportCustomValidity={ ( value ) => {
					if ( value ) {
						return 'This checkbox may not be checked.';
					}
				} }
			/>
		);
	},
};
