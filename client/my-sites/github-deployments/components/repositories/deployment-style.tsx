import { useI18n } from '@wordpress/react-i18n';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';

interface DeploymentStyleProps {
	onChange?( query: string ): void;
}

export const DeploymentStyle = ( { onChange }: DeploymentStyleProps ) => {
	const { __ } = useI18n();

	return (
		<div className="deployment-style">
			<h3 style={ { fontSize: '16px', marginBottom: '16px' } }>
				{ __( 'Pick your deployment style' ) }
			</h3>
			<FormRadiosBar
				items={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Customizable' ), value: 'custom' },
				] }
				checked="simple"
				onChange={ () => {} }
				disabled={ false }
			/>
		</div>
	);
};
