import { FormLabel } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import FormFieldset from 'calypso/components/forms/form-fieldset';

import './style.scss';

interface AutomaticActivationToggleProps {
	onChange( value: boolean ): void;
	value: boolean;
	type: string;
}

export const AutomaticActivationToggle = ( {
	onChange,
	value,
	type,
}: AutomaticActivationToggleProps ) => {
	const { __ } = useI18n();
	const text =
		type === 'plugin'
			? __( 'Activate plugin after first successful deployment' )
			: __( 'Activate theme after first deployment' );
	return (
		<FormFieldset>
			<FormLabel htmlFor="is-automated">{ __( 'Activate' ) }</FormLabel>
			<div className="automated-deployments-toggle-switch">
				<FormToggle id="is-automated" onChange={ () => onChange( ! value ) } checked={ value } />
				{ text }
			</div>
		</FormFieldset>
	);
};
