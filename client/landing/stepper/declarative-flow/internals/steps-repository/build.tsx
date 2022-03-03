import { useI18n } from '@wordpress/react-i18n';
import type { Step } from '../types';

/**
 * The build step
 */
const BuildStep: Step = function BuildStep( { navigation } ) {
	const { __ } = useI18n();
	const { goNext, goBack } = navigation;

	return (
		<div>
			<h1>Build step</h1>
			<button onClick={ goBack }>{ __( 'Previous' ) }</button>
			<button onClick={ goNext }>{ __( 'Next' ) }</button>
		</div>
	);
};

export default BuildStep;
