import { HelpCenterSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useFlowCustomOptions, useFlowZendeskUserFields } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { FC, ReactNode } from 'react';

interface HelpCenterInlineButtonProps {
	flowName?: string;
	children?: ReactNode;
	className?: string;
}

/**
 * Toggles the Help Center. If no flowName is supplied it opens the default
 * route (/odie).
 *
 * If the flowName is supplied and the flow is a premium flow, it will directly open
 * a chat with Happiness Engineers.
 */
const HelpCenterInlineButton: FC< HelpCenterInlineButtonProps > = ( {
	flowName,
	children,
	className,
} ) => {
	const { setShowHelpCenter, setNavigateToRoute, setNewMessagingChat } =
		useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const flowCustomOptions = useFlowCustomOptions( flowName || '' );
	const { userFieldMessage, userFieldFlowName } = useFlowZendeskUserFields( flowName || '' );

	function toggleHelpCenter() {
		setShowHelpCenter( ! isShowingHelpCenter, flowCustomOptions );
		if ( flowCustomOptions?.hasPremiumSupport ) {
			setNewMessagingChat( {
				initialMessage: userFieldMessage || '',
				userFieldFlowName: userFieldFlowName || '',
			} );
		} else {
			setNavigateToRoute( '/odie' );
		}
	}

	return (
		<Button onClick={ toggleHelpCenter } className={ clsx( className, 'is-link' ) }>
			{ children }
		</Button>
	);
};

export default HelpCenterInlineButton;
