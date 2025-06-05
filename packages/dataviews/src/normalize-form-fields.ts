/**
 * Internal dependencies
 */
import type { Form } from './types';

interface NormalizedFormField {
	id: string;
	layout: 'regular' | 'panel';
	labelPosition: 'side' | 'top' | 'none';
}

export default function normalizeFormFields(
	form: Form
): NormalizedFormField[] {
	let layout: 'regular' | 'panel' = 'regular';
	if ( [ 'regular', 'panel' ].includes( form.type ?? '' ) ) {
		layout = form.type as 'regular' | 'panel';
	}

	const labelPosition =
		form.labelPosition ?? ( layout === 'regular' ? 'top' : 'side' );

	return ( form.fields ?? [] ).map( ( field ) => {
		if ( typeof field === 'string' ) {
			return {
				id: field,
				layout,
				labelPosition,
			};
		}

		const fieldLayout = field.layout ?? layout;
		const fieldLabelPosition =
			field.labelPosition ??
			( fieldLayout === 'regular' ? 'top' : 'side' );
		return {
			...field,
			layout: fieldLayout,
			labelPosition: fieldLabelPosition,
		};
	} );
}
