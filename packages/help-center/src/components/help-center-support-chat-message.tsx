import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getRelativeTimeString, useLocale } from '@automattic/i18n-utils';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import type { ZendeskMessage } from '@automattic/odie-client';

import './help-center-support-chat-message.scss';

const trackContactButtonClicked = ( sectionName: string ) => {
	recordTracksEvent( 'calypso_inlinehelp_support_chat_message_click', {
		force_site_id: true,
		location: 'help-center',
		section: sectionName,
	} );
};

export const HelpCenterSupportChatMessage = ( {
	message,
	navigateTo = '',
	avatarSize = 32,
	isUnread = false,
}: {
	message: ZendeskMessage;
	navigateTo: string;
	avatarSize?: number;
	isUnread: boolean;
} ) => {
	const { __ } = useI18n();
	const locale = useLocale();

	const { displayName, received, text, avatarUrl } = message;
	const helpCenterContext = useHelpCenterContext();
	const sectionName = helpCenterContext.sectionName;

	return (
		<Link
			// TODO: remove hardcoded value
			to={ 'odie' || navigateTo }
			target="_self"
			onClick={ () => trackContactButtonClicked( sectionName ) }
			className={ clsx( 'help-center-support-chat__conversation-container', {
				'is-unread-message': isUnread,
			} ) }
		>
			<div className="help-center-support-chat__conversation-avatar">
				<img
					src={ avatarUrl }
					alt={ __( 'User Avatar' ) }
					height={ avatarSize }
					width={ avatarSize }
				/>
			</div>
			<div className="help-center-support-chat__conversation-information">
				<div className="help-center-support-chat__conversation-information-message">{ text }</div>
				<div className="help-center-support-chat__conversation-sub-information">
					<span className="help-center-support-chat__conversation-information-name">
						{ displayName }
					</span>
					<Icon
						size={ 2 }
						icon={
							<svg
								width="2"
								height="2"
								viewBox="0 0 2 2"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="1" cy="1" r="1" fill="#787C82" />
							</svg>
						}
					/>
					<span>
						{ getRelativeTimeString( {
							timestamp: received * 1000,
							locale,
							style: 'long',
						} ) }
					</span>
				</div>
			</div>
			<div className="help-center-support-chat__open-conversation">
				<Icon icon={ chevronRight } size={ 24 } />
			</div>
		</Link>
	);
};
