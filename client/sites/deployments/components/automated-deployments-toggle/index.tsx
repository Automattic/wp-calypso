import { FormLabel } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import FormFieldset from 'calypso/components/forms/form-fieldset';

import './style.scss';

interface AutomatedDeploymentsToggleProps {
	onChange( value: boolean ): void;
	value: boolean;
	hasWorkflowPath: boolean;
}

export const AutomatedDeploymentsToggle = ( {
	onChange,
	value,
	hasWorkflowPath,
}: AutomatedDeploymentsToggleProps ) => {
	const { __ } = useI18n();

	return (
		<FormFieldset>
			<FormLabel htmlFor="is-automated">{ __( 'Automatic deployments' ) }</FormLabel>
			<div className="automated-deployments-toggle-switch">
				<FormToggle id="is-automated" onChange={ () => onChange( ! value ) } checked={ value } />
				{
					// Translators: %(condition)s is the when we are going to deploy the changes
					sprintf( __( 'Deploy changes on %(condition)s' ), {
						condition: hasWorkflowPath ? __( 'workflow run completion' ) : __( 'push' ),
					} )
				}
			</div>
		</FormFieldset>
	);
};
