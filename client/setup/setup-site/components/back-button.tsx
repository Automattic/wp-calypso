import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useStepBackHref, useStepBackNav } from '../hooks/use-setup-nav';
import { StepSlug } from '../types';

export function BackButton( { defaultBack }: { defaultBack: StepSlug } ): React.ReactElement {
	const translate = useTranslate();
	const stepBackHref = useStepBackHref( { defaultBack } );
	const stepBackNav = useStepBackNav( { defaultBack } );
	return (
		<Button href={ stepBackHref() } onClick={ () => stepBackNav() }>
			{ translate( 'Back' ) }
		</Button>
	);
}
