import { HelpCenterSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useFlowCustomOptions, useFlowZendeskUserFields } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { FC } from 'react';

interface HelpCenterStepButtonProps {
	hasPremiumSupport?: boolean;
	flowName?: string;
	helpCenterButtonCopy?: string;
	helpCenterButtonLink?: string;
}

const HelpCenterStepButton: FC< HelpCenterStepButtonProps > = ( {
	hasPremiumSupport,
	flowName,
	helpCenterButtonCopy,
	helpCenterButtonLink,
} ) => {
	const translate = useTranslate();
	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const flowCustomOptions = useFlowCustomOptions( flowName || '' );
	const { userFieldMessage, userFieldFlowName } = useFlowZendeskUserFields( flowName || '' );

	function toggleHelpCenter() {
		if ( ! isShowingHelpCenter ) {
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

		setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport, flowCustomOptions );
	}

	return (
		<div className="step-wrapper__help-center-button-container">
			<label>{ helpCenterButtonCopy ?? translate( 'Need extra help?' ) }</label>
			<Button className="step-wrapper__help-center-button" onClick={ toggleHelpCenter }>
				{ helpCenterButtonLink ?? translate( 'Visit Help Center' ) }
			</Button>
		</div>
	);
};

export default HelpCenterStepButton;
