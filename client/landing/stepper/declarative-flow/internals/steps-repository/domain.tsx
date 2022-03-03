import { useI18n } from '@wordpress/react-i18n';
import type { Step } from '../types';

/**
 * The domain step
 */
const DomainStep: Step = function DomainStep( { navigation } ) {
	const { __ } = useI18n();
	const { goNext, goBack } = navigation;

	return (
		<div>
			<h1>Domain step</h1>
			<button onClick={ goBack }>{ __( 'Previous' ) }</button>
			<button onClick={ goNext }>{ __( 'Next' ) }</button>
		</div>
	);
};

export default DomainStep;
