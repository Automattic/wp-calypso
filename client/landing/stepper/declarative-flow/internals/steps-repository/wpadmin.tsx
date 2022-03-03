import { useI18n } from '@wordpress/react-i18n';
import type { Step } from '../types';

/**
 * The wp-admin step
 */
const WpAdminStep: Step = function WpAdminStep( { navigation } ) {
	const { __ } = useI18n();
	const { goNext, goBack } = navigation;

	return (
		<div>
			<h1>Wp Admin</h1>
			<button onClick={ goBack }>{ __( 'Previous' ) }</button>
			<button onClick={ goNext }>{ __( 'Next' ) }</button>
		</div>
	);
};

export default WpAdminStep;
