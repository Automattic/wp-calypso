import { createComponentImplementation } from '@a2ui/react/v0_9';
import { CheckBoxApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { CheckboxControl } from '@wordpress/components';
import { z } from 'zod';
import useInputValue from './use-input-value';

export default createComponentImplementation(
	{
		name: CheckBoxApi.name,
		schema: CheckBoxApi.schema.pick( { label: true, value: true } ).extend( {
			label: z.union( [ z.string(), DataBindingSchema ] ),
			value: z.union( [ z.boolean(), DataBindingSchema ] ),
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? false, props.setValue, context );
		return <CheckboxControl label={ props.label } checked={ value } onChange={ onChange } />;
	}
);
