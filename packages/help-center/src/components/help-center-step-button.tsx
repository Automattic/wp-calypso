import { HelpCenterSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useFlowCustomOptions, useFlowZendeskUserFields } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { FC } from 'react';

interface HelpCenterButtonProps {
	helpCenterButtonText?: string;
	hasPremiumSupport?: boolean;
	flowName?: string;
}

const HelpCenterButton: FC< HelpCenterButtonProps > = ( {
	helpCenterButtonText,
	hasPremiumSupport,
	flowName,
} ) => {
	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const flowCustomOptions = useFlowCustomOptions( flowName || '' );
	const { userFieldMessage, userFieldFlowName } = useFlowZendeskUserFields( flowName || '' );

	if ( ! helpCenterButtonText ) {
		return null;
	}

	function openHelpCenter() {
		setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport, flowCustomOptions );
		if ( hasPremiumSupport ) {
			const urlWithQueryArgs = addQueryArgs( '/odie?provider=zendesk', {
				userFieldMessage,
				userFieldFlowName,
			} );
			setNavigateToRoute( urlWithQueryArgs );
		} else {
			setNavigateToRoute( `/odie` );
		}
	}

	return (
		<Button onClick={ openHelpCenter } className="step-wrapper__help-center-button">
			{ helpCenterButtonText }
		</Button>
	);
};

export default HelpCenterButton;
