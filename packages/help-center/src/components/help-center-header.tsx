/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useGetHistoryChats } from '@automattic/help-center/src/hooks/use-get-history-chats';
import { useCurrentSupportInteraction } from '@automattic/odie-client/src/data/use-current-support-interaction';
import {
	CardHeader,
	Button,
	Flex,
	__experimentalHStack as HStack,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import {
	lineSolid,
	moreVertical,
	close,
	chevronUp,
	Icon,
	comment,
	bell,
	backup,
} from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';
import { BackButton } from './back-button';
import type { Header } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';
export const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/edit-site'
);

const { Menu } = unlock( componentsPrivateApis );

import './help-center-header.scss';

const MutedBellIcon = () => (
	<div style={ { position: 'relative', display: 'inline-block' } }>
		<Icon icon={ bell } width={ 24 } height={ 24 } />
		<svg
			style={ { position: 'absolute', top: 0, left: 0 } }
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
		>
			<path d="M2 22L22 2" stroke="#757575" strokeWidth="1.5" />
		</svg>
	</div>
);

const EllipsisMenu = () => {
	const { __ } = useI18n();
	const navigate = useNavigate();
	const { recentConversations } = useGetHistoryChats();
	const { areSoundNotificationsEnabled } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			areSoundNotificationsEnabled: helpCenterSelect.getAreSoundNotificationsEnabled(),
		};
	}, [] );
	const { setAreSoundNotificationsEnabled, setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const clearChat = async () => {
		recordTracksEvent( 'calypso_inlinehelp_clear_conversation' );
		navigate( '/odie' );
	};

	const handleViewChats = () => {
		recordTracksEvent( 'calypso_inlinehelp_view_open_chats_menu', {
			total_number_of_conversations: recentConversations.length,
		} );
		navigate( '/chat-history' );
	};

	const toggleSoundNotifications = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		setAreSoundNotificationsEnabled( ! areSoundNotificationsEnabled );
	};

	return (
		<Menu>
			<Menu.TriggerButton
				title={ __( 'Help Center Options', __i18n_text_domain__ ) }
				render={ <Button icon={ moreVertical } /> }
			/>
			<Menu.Popover>
				<Menu.Item
					prefix={ <Icon icon={ lineSolid } width={ 20 } height={ 20 } /> }
					onClick={ () => setIsMinimized( true ) }
				>
					<Menu.ItemLabel>{ __( 'Minimize', __i18n_text_domain__ ) }</Menu.ItemLabel>
				</Menu.Item>
				<Menu.Separator />
				<Menu.Item
					onClick={ clearChat }
					prefix={ <Icon icon={ comment } width={ 24 } height={ 24 } /> }
				>
					<Menu.ItemLabel>{ __( 'New chat', __i18n_text_domain__ ) }</Menu.ItemLabel>
				</Menu.Item>
				<Menu.Item
					onClick={ handleViewChats }
					prefix={ <Icon icon={ backup } width={ 24 } height={ 24 } /> }
				>
					<Menu.ItemLabel>{ __( 'Support history', __i18n_text_domain__ ) }</Menu.ItemLabel>
				</Menu.Item>
				<Menu.Separator />
				<Menu.Item
					onClick={ toggleSoundNotifications }
					prefix={
						areSoundNotificationsEnabled ? (
							<MutedBellIcon />
						) : (
							<Icon icon={ bell } width={ 24 } height={ 24 } />
						)
					}
				>
					<Menu.ItemLabel>
						{ areSoundNotificationsEnabled
							? __( 'Turn off sound notifications', __i18n_text_domain__ )
							: __( 'Turn on sound notifications', __i18n_text_domain__ ) }
					</Menu.ItemLabel>
				</Menu.Item>
			</Menu.Popover>
		</Menu>
	);
};

const useHeaderText = () => {
	const { __ } = useI18n();
	const { pathname } = useLocation();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();

	const isConversationWithZendesk = currentSupportInteraction?.events.some(
		( event ) => event.event_source === 'zendesk'
	);

	return useMemo( () => {
		switch ( pathname ) {
			case '/':
				return __( 'Help Center', __i18n_text_domain__ );
			case '/inline-chat':
				return __( 'Live Chat', __i18n_text_domain__ );
			case '/contact-form':
				return __( 'Send us an email', __i18n_text_domain__ );
			case '/post':
			case '/post/':
				return __( 'Support guide', __i18n_text_domain__ );
			case '/success':
				return __( 'Message Submitted', __i18n_text_domain__ );
			case '/odie':
				return isConversationWithZendesk
					? __( 'Support Team', __i18n_text_domain__ )
					: __( 'Support Assistant', __i18n_text_domain__ );
			case '/chat-history':
				return __( 'Support history', __i18n_text_domain__ );
			case '/support-guides':
				return __( 'Support guides', __i18n_text_domain__ );
			default:
				return __( 'Help Center', __i18n_text_domain__ );
		}
	}, [ __, isConversationWithZendesk, pathname ] );
};

const HeaderText = () => {
	const headerText = useHeaderText();
	const { unreadCount, isMinimized } = useSelect( ( select ) => {
		return {
			unreadCount: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
			isMinimized: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getIsMinimized(),
		};
	}, [] );

	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	return (
		<span id="header-text" role="presentation" className="help-center-header__text">
			{ headerText }
			{ unreadCount > 0 && isMinimized && (
				<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
			) }
		</span>
	);
};

const HelpCenterHeader = ( { onDismiss }: Header ) => {
	const { __ } = useI18n();
	const location = useLocation();
	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const unreadCount = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
		[]
	);

	const { pathname } = useLocation();
	const { helpCenterOptions, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			helpCenterOptions: store.getHelpCenterOptions(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { disableChatSupport } = useHelpCenterContext();

	const classNames = clsx(
		'help-center__container-header',
		location?.pathname?.replace( /^\//, '' ),
		{
			'has-unread': unreadCount > 0 && isMinimized,
		}
	);

	const userAskingSupport =
		pathname.startsWith( '/odie' ) || pathname.startsWith( '/contact-form' );
	const isHelpCenterHome = pathname === '/';
	// Show the back button if it's not the help center home page and:
	// - it's a chat and the hideBackButton option is not set
	// - it's not a chat
	const shouldShowBackButton =
		! isHelpCenterHome &&
		( ( userAskingSupport && ! helpCenterOptions?.hideBackButton ) || ! userAskingSupport );

	if ( isMinimized ) {
		return (
			<button
				name={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
				className={ classNames }
				onClick={ () => setIsMinimized( false ) }
				aria-label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
			>
				<HStack alignment="center" justify="space-between" spacing={ 5 }>
					<HStack justify="flex-start">
						<HeaderText />
					</HStack>
					<Icon icon={ chevronUp } />
				</HStack>
			</button>
		);
	}

	return (
		<CardHeader className={ classNames }>
			<Flex>
				{ shouldShowBackButton ? <BackButton /> : null }
				<HeaderText />
				{ disableChatSupport ? (
					<Button
						label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
						tooltipPosition="top left"
						icon={ lineSolid }
						onClick={ () => setIsMinimized( true ) }
					/>
				) : (
					// We only show the ellipsis menu if chat support is enabled
					<EllipsisMenu />
				) }

				<Button
					className="help-center-header__close"
					label={ __( 'Close Help Center', __i18n_text_domain__ ) }
					tooltipPosition="top left"
					icon={ close }
					onClick={ onDismiss }
				/>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
