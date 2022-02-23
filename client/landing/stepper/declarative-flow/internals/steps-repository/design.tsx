import { useI18n } from '@wordpress/react-i18n';
import type { Step } from '../types';

/**
 * The design step
 */
const DesignStep: Step = function DesignStep( { navigation } ) {
	const { __ } = useI18n();
	const { goNext, goBack } = navigation;

	return (
		<div>
			<h1>Design step</h1>
			<button onClick={ goBack }>{ __( 'Previous' ) }</button>
			<button onClick={ goNext }>{ __( 'Next' ) }</button>
		</div>
	);
};

export default DesignStep;
