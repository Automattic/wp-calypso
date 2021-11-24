import ImportedIntentScreen from 'calypso/signup/steps/intent/intent-screen';
import { IntentFlag } from 'calypso/signup/steps/intent/types';
import { useStepNav } from '../hooks/use-setup-nav';

export function IntentScreen(): React.ReactElement {
	const page = useStepNav();

	const handleSelect = ( intent: IntentFlag ) => {
		if ( intent === 'write' ) {
			page( 'site-options' );
		} else {
			page( 'design' );
		}
	};

	return <ImportedIntentScreen onSelect={ handleSelect } />;
}
