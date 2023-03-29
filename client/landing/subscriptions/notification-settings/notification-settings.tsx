import { Gridicon, Popover } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { usePopoverToggle } from '../hooks';
import { EmailFrequencyType } from '../types';
import EmailFrequency from './email-frequency';
import './styles.scss';

type NotificationSettingsProps = {
	children?: React.ReactNode;
	emailFrequency: EmailFrequencyType;
	sendCommentsByEmail: boolean;
	sendPostsByEmail: boolean;
	sendPostsByNotification: boolean;
	onChangeEmailFrequency: ( emailFrequency: EmailFrequencyType ) => void;
	onChangeSendCommentsByEmail: ( sendCommentsByEmail: boolean ) => void;
	onChangeSendPostsByEmail: ( sendPostsByEmail: boolean ) => void;
	onChangeSendPostsByNotification: ( sendPostsByNotification: boolean ) => void;
};

const NotificationSettings = ( {
	children,
	emailFrequency,
	sendCommentsByEmail,
	sendPostsByEmail,
	sendPostsByNotification,
	onChangeEmailFrequency,
	onChangeSendCommentsByEmail,
	onChangeSendPostsByEmail,
	onChangeSendPostsByNotification,
}: NotificationSettingsProps ) => {
	const isEmailBlocked = useSelector( ( state ) =>
		getUserSetting( state, 'subscription_delivery_email_blocked' )
	);

	const { showPopover, onToggle, onClose } = usePopoverToggle();

	const buttonRef = useRef< HTMLButtonElement >( null );
	const iconRef = useRef< SVGSVGElement >( null );
	const translate = useTranslate();

	return (
		<div className="notification-settings__popover-context">
			<button className="notification-settings__toggle" onClick={ onToggle } ref={ buttonRef }>
				<Gridicon icon="ellipsis" size={ 24 } ref={ iconRef } />
			</button>

			<Popover
				onClose={ onClose }
				isVisible={ showPopover }
				context={ iconRef.current }
				ignoreContext={ buttonRef.current }
				position="bottom left"
				className="notification-settings__popover"
			>
				<div className="notification-settings__popover-toggle">
					<ToggleControl
						onChange={ () => onChangeSendPostsByNotification( ! sendPostsByNotification ) }
						checked={ sendPostsByNotification }
						label={ translate( 'Notify me of new posts' ) }
					/>
					<p className="notification-settings__popover-hint">
						{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
					</p>
				</div>

				{ isEmailBlocked && (
					<div className="notification-settings__popover-instructions">
						<p className="notification-settings__popover-instructions-title">
							{ translate( 'Email me new posts' ) }
						</p>
						<p className="notification-settings__popover-instructions-text">
							{ translate(
								'You currently have email delivery turned off. Visit your {{a}}Notification Settings{{/a}} to turn it back on.',
								{
									components: {
										a: <a href="/me/notifications/subscriptions" />,
									},
								}
							) }
						</p>
					</div>
				) }

				{ ! isEmailBlocked && (
					<>
						<div className="notification-settings__popover-toggle">
							<ToggleControl
								onChange={ () => onChangeSendPostsByEmail( ! sendPostsByEmail ) }
								checked={ sendPostsByEmail }
								label={ translate( 'Email me new posts' ) }
							/>
						</div>

						{ sendPostsByEmail && (
							<EmailFrequency onChange={ onChangeEmailFrequency } value={ emailFrequency } />
						) }

						<div className="notification-settings__popover-toggle">
							<ToggleControl
								onChange={ () => onChangeSendCommentsByEmail( ! sendCommentsByEmail ) }
								checked={ sendCommentsByEmail }
								label={ translate( 'Email me new comments' ) }
							/>
						</div>
					</>
				) }

				{ children }
			</Popover>
		</div>
	);
};

export default NotificationSettings;
