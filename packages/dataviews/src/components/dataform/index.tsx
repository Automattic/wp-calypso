/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DataFormProps } from '../../types';
import { DataFormProvider } from '../dataform-context';
import { normalizeFields } from '../../normalize-fields';
import { DataFormFieldOrchestrator } from '../../dataforms-layouts/data-form-orchestrator';

export default function DataForm< Item >( {
	data,
	form,
	fields,
	onChange,
	validation,
}: DataFormProps< Item > ) {
	const normalizedFields = useMemo(
		() => normalizeFields( fields ),
		[ fields ]
	);

	if ( ! form.fields ) {
		return null;
	}

	return (
		<DataFormProvider fields={ normalizedFields } validation={ validation }>
			<DataFormFieldOrchestrator
				data={ data }
				form={ form }
				onChange={ onChange }
			/>
		</DataFormProvider>
	);
}
