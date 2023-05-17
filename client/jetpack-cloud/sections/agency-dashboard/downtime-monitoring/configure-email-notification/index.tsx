import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmailItemContent from './email-item-content';
import type {
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

import './style.scss';

interface Props {
	toggleModal: ( item?: StateMonitorSettingsEmail, action?: AllowedMonitorContactActions ) => void;
	allEmailItems: Array< StateMonitorSettingsEmail >;
}

export default function ConfigureEmailNotification( { toggleModal, allEmailItems }: Props ) {
	const translate = useTranslate();

	return (
		<div className="configure-email-address__card-container">
			{ allEmailItems.map( ( item ) => (
				<EmailItemContent key={ item.email } item={ item } toggleModal={ toggleModal } />
			) ) }
			<Button
				compact
				className="configure-email-address__button"
				onClick={ () => toggleModal() }
				aria-label={ translate( 'Add email address' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add email address' ) }
			</Button>
		</div>
	);
}
