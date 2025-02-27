import { HelpCenterSelect } from '@automattic/data-stores';
import {
	DIFM_FLOW,
	DIFM_FLOW_STORE,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	WEBSITE_DESIGN_SERVICES,
} from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { HELP_CENTER_STORE } from '../stores';
import type { FC } from 'react';

const FLOWS_INITIAL_MESSAGES = {
	[ DIFM_FLOW ]: 'User is purchasing DIFM plan.',
	[ DIFM_FLOW_STORE ]: 'User is purchasing DIFM store plan.',
	[ WEBSITE_DESIGN_SERVICES ]: 'User is purchasing DIFM website design services.',
	[ HUNDRED_YEAR_PLAN_FLOW ]: 'User is purchasing 100 year plan.',
	[ HUNDRED_YEAR_DOMAIN_FLOW ]: 'User is purchasing 100 year domain.',
};

const FLOWS_FLOWNAME = {
	[ DIFM_FLOW ]: 'messaging_flow_dotcom_difm',
	[ DIFM_FLOW_STORE ]: 'messaging_flow_dotcom_difm',
	[ WEBSITE_DESIGN_SERVICES ]: 'messaging_flow_dotcom_difm',
};

export function getZendeskUserFieldsByFlow( flowName: string ) {
	const url = window.location.href;
	let userFieldFlowName = null;
	let userFieldMessage = null;

	if ( Object.keys( FLOWS_INITIAL_MESSAGES ).includes( flowName ) ) {
		userFieldMessage = `${
			FLOWS_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_INITIAL_MESSAGES ]
		} URL: ${ url }`;
	}

	if ( Object.keys( FLOWS_FLOWNAME ).includes( flowName ) ) {
		userFieldFlowName = FLOWS_FLOWNAME[ flowName as keyof typeof FLOWS_FLOWNAME ];
	}

	return {
		userFieldMessage,
		userFieldFlowName,
	};
}

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

	if ( ! helpCenterButtonText ) {
		return null;
	}

	function openHelpCenter() {
		setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport );
		if ( hasPremiumSupport ) {
			const { userFieldMessage, userFieldFlowName } = getZendeskUserFieldsByFlow( flowName || '' );
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
