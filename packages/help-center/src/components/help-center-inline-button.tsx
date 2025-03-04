import { HelpCenterSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useFlowCustomOptions, useFlowZendeskUserFields } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { FC, ReactNode } from 'react';

interface HelpCenterInlineButtonProps {
	hasPremiumSupport?: boolean;
	flowName?: string;
	children?: ReactNode;
	className?: string;
}

const HelpCenterInlineButton: FC< HelpCenterInlineButtonProps > = ( {
	hasPremiumSupport,
	flowName,
	children,
	className,
} ) => {
	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const flowCustomOptions = useFlowCustomOptions( flowName || '' );
	const { userFieldMessage, userFieldFlowName } = useFlowZendeskUserFields( flowName || '' );

	function toggleHelpCenter() {
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
		<Button onClick={ toggleHelpCenter } className={ clsx( className, 'is-link' ) }>
			{ children }
		</Button>
	);
};

export default HelpCenterInlineButton;
