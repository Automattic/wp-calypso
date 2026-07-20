import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { Button, CardFooter } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSiteConnectionHealth } from '../data/use-site-connection-health';
import { useSupportStatus } from '../data/use-support-status';
import { useChatStatus, useGetHistoryChats, useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { getChatLinkFromConversation } from './utils';

import './help-center-footer.scss';

export const HelpCenterContactButton = () => {
	const { __ } = useI18n();
	const { url } = useStillNeedHelpURL();
	const { sectionName, site } = useHelpCenterContext();
	const navigate = useNavigate();
	const { setMessage, setNewMessagingChat } = useDispatch( HELP_CENTER_STORE );
	const isOdieRoute = url === '/odie';
	const { isEligibleForChat } = useChatStatus();
	const { isLoading: isLoadingSupportStatus } = useSupportStatus();
	const { isSiteUnreachable, isLoading: isCheckingConnectionHealth } = useSiteConnectionHealth(
		isOdieRoute && isEligibleForChat
	);
	const searchQuery = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getMessage(),
		[]
	);
	const { recentConversations } = useGetHistoryChats();

	const showContactHumanButton = isOdieRoute && isEligibleForChat && isSiteUnreachable;
	const isResolvingHumanRoute =
		isOdieRoute && ( isLoadingSupportStatus || isCheckingConnectionHealth );

	const handleContactHumanClick = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: 'human',
		} );

		setNewMessagingChat( {
			initialMessage: searchQuery || '',
			section: sectionName,
			siteUrl: site?.URL,
			siteId: site?.ID ? String( site.ID ) : undefined,
		} );
		setMessage( '' );
	};

	const handleClick = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: 'ai',
		} );

		const openRecentConversation = recentConversations.find(
			( conversation ) => conversation.metadata?.status === 'open'
		);

		if ( url === '/odie' && openRecentConversation ) {
			navigate( getChatLinkFromConversation( openRecentConversation ) );
		} else {
			navigate(
				url === '/odie' && searchQuery ? `/odie?query=${ encodeURIComponent( searchQuery ) }` : url
			);
		}

		setMessage( '' );
	};

	return (
		<CardFooter className="help-center__container-footer">
			{ showContactHumanButton ? (
				<Button
					onClick={ handleContactHumanClick }
					variant="secondary"
					className="button help-center-contact-page__button"
					__next40pxDefaultSize
				>
					{ __( 'Contact a Happiness Engineer', __i18n_text_domain__ ) }
				</Button>
			) : (
				<Button
					onClick={ handleClick }
					variant="secondary"
					className="button help-center-contact-page__button"
					disabled={ isResolvingHumanRoute }
					isBusy={ isResolvingHumanRoute }
					accessibleWhenDisabled
					__next40pxDefaultSize
				>
					{ __( 'Get help', __i18n_text_domain__ ) }
				</Button>
			) }
		</CardFooter>
	);
};

const HelpCenterFooter: React.FC = () => {
	return (
		<>
			<Routes>
				<Route path="/" element={ <HelpCenterContactButton /> } />
				<Route path="/post" element={ <HelpCenterContactButton /> } />
				<Route path="/chat-history" element={ <HelpCenterContactButton /> } />
				<Route path="/support-guides" element={ <HelpCenterContactButton /> } />
				<Route path="*" element={ null } />
			</Routes>
		</>
	);
};

export default HelpCenterFooter;
