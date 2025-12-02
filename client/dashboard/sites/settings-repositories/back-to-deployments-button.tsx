import { __ } from '@wordpress/i18n';
import SnackbarBackButton from '../../components/snackbar-back-button';

export function BackToDeploymentsButton() {
	return <SnackbarBackButton>{ __( 'Back to Deployments' ) }</SnackbarBackButton>;
}
