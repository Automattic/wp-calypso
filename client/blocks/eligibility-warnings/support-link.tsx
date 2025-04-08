import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import { clearHelpCenterZendeskConversationStarted } from '@automattic/odie-client/src/utils/storage-utils';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { localize, LocalizeProps } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import ActionPanelLink from 'calypso/components/action-panel/link';
import { getSectionName } from 'calypso/state/ui/selectors';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

const SupportLink = ( {
	onShowHelpAssistant = () => {},
	translate,
	shouldUseHelpAssistant = false,
}: {
	onShowHelpAssistant?: () => void;
	shouldUseHelpAssistant?: boolean;
} & LocalizeProps ) => {
	const sectionName = useSelector( getSectionName );
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );
	const { setShowHelpCenter, setIsMinimized, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const resetSupportInteraction = useResetSupportInteraction();

	const clearChat = useCallback( async () => {
		await resetSupportInteraction();
		clearHelpCenterZendeskConversationStarted();
		recordTracksEvent( 'calypso_inlinehelp_clear_conversation' );
	}, [ resetSupportInteraction ] );

	const handleShowHelpAssistant = useCallback( async () => {
		onShowHelpAssistant();

		setNavigateToRoute( '/odie' );
		await clearChat();

		if ( ! show ) {
			setShowHelpCenter( true );

			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );
		}

		if ( isMinimized ) {
			setIsMinimized( false );
		}
	}, [
		onShowHelpAssistant,
		setNavigateToRoute,
		clearChat,
		show,
		setShowHelpCenter,
		sectionName,
		isMinimized,
		setIsMinimized,
	] );

	return (
		<div className="support-block">
			{ shouldUseHelpAssistant ? (
				translate( '{{button}}Need help?{{/button}}', {
					components: {
						button: <Button variant="link" onClick={ handleShowHelpAssistant } />,
					},
				} )
			) : (
				<>
					<span>{ translate( 'Need help?' ) }</span>
					{ translate( '{{a}}Contact support{{/a}}', {
						components: {
							a: <ActionPanelLink href="/help/contact" />,
						},
					} ) }
				</>
			) }
		</div>
	);
};

export default localize( SupportLink );
