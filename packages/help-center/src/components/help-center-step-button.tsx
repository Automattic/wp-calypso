import { HelpCenterSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useFlowCustomOptions, useFlowZendeskUserFields } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { FC } from 'react';

interface HelpCenterStepButtonProps {
	helpCenterButtonText?: string;
	hasPremiumSupport?: boolean;
	flowName?: string;
}

const HelpCenterStepButton: FC< HelpCenterStepButtonProps > = ( {
	helpCenterButtonText,
	hasPremiumSupport,
	flowName,
} ) => {
	const translate = useTranslate();
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
		<div className="step-wrapper__help-center-button-container">
			{ translate( 'Questions? {{a}}Contact our site building team{{/a}}', {
				components: {
					a: <Button onClick={ openHelpCenter } className="step-wrapper__help-center-button" />,
				},
			} ) }
		</div>
	);
};

export default HelpCenterStepButton;
