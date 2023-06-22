import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmailItemContent from './email-item-content';
import type {
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

import '../style.scss';

interface Props {
	toggleModal: ( item?: StateMonitorSettingsEmail, action?: AllowedMonitorContactActions ) => void;
	allEmailItems: Array< StateMonitorSettingsEmail >;
	recordEvent: ( action: string, params?: object ) => void;
	verifiedEmail?: string;
}

export default function ConfigureEmailNotification( {
	toggleModal,
	allEmailItems,
	recordEvent,
	verifiedEmail,
}: Props ) {
	const translate = useTranslate();

	const handleAddEmailClick = () => {
		recordEvent( 'add_email_address_click' );
		toggleModal();
	};

	return (
		<div className="configure-contact__card-container">
			{ allEmailItems.map( ( item ) => (
				<EmailItemContent
					key={ item.email }
					item={ item }
					toggleModal={ toggleModal }
					recordEvent={ recordEvent }
					showVerifiedBadge={ item.email === verifiedEmail }
				/>
			) ) }
			<Button
				compact
				className="configure-contact__button"
				onClick={ handleAddEmailClick }
				aria-label={ translate( 'Add email address' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add email address' ) }
			</Button>
		</div>
	);
}
