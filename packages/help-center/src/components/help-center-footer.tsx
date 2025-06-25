import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, CardFooter } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { backup, comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, ReactNode } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useGetHistoryChats, useStillNeedHelpURL } from '../hooks';

import './help-center-footer.scss';

const HelpCenterFooterButton = ( {
	children,
	eventName,
	buttonTextEventProp,
	redirectTo,
	icon,
}: {
	children: ReactNode;
	eventName: string;
	buttonTextEventProp: string;
	redirectTo: string;
	icon: ReactElement;
} ) => {
	const { url, isLoading } = useStillNeedHelpURL();
	const { sectionName } = useHelpCenterContext();
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';
	const navigate = useNavigate();
	const [ isCreatingChat, setIsCreatingChat ] = useState( false );
	const handleContactButtonClicked = ( {
		eventName,
		buttonTextEventProp,
	}: {
		eventName: string;
		buttonTextEventProp: string;
	} ) => {
		recordTracksEvent( eventName, {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: buttonTextEventProp,
		} );
	};

	const redirectionURL = () => {
		if ( buttonTextEventProp === 'Still need help?' ) {
			if ( isLoading ) {
				return '';
			}
			return redirectToWpcom ? { pathname: url } : url;
		}
		return redirectTo;
	};

	const handleClick = async () => {
		setIsCreatingChat( true );
		handleContactButtonClicked( {
			eventName: eventName,
			buttonTextEventProp: buttonTextEventProp,
		} );

		setIsCreatingChat( false );
		const url = redirectionURL();
		navigate( url );
	};

	return (
		<Button
			onClick={ handleClick }
			disabled={ isCreatingChat }
			className="button help-center-contact-page__button"
		>
			<Icon icon={ icon } />
			{ children }
		</Button>
	);
};

export const HelpCenterContactButton = () => {
	const { recentConversations } = useGetHistoryChats();
	const { __ } = useI18n();

	return (
		<>
			<HelpCenterFooterButton
				icon={ comment }
				eventName="calypso_inlinehelp_morehelp_click"
				buttonTextEventProp="Still need help?"
				redirectTo="/odie"
			>
				{ __( 'Still need help?', __i18n_text_domain__ ) }
			</HelpCenterFooterButton>

			{ recentConversations.length > 1 && (
				<HelpCenterFooterButton
					icon={ backup }
					eventName="calypso_inlinehelp_history_click"
					buttonTextEventProp="History"
					redirectTo="/chat-history"
				>
					{ __( 'History', __i18n_text_domain__ ) }
				</HelpCenterFooterButton>
			) }
		</>
	);
};

const HelpCenterFooter: React.FC = () => {
	return (
		<CardFooter className="help-center__container-footer">
			<Routes>
				<Route path="/" element={ <HelpCenterContactButton /> } />
				<Route path="*" element={ null } />
			</Routes>
		</CardFooter>
	);
};

export default HelpCenterFooter;
