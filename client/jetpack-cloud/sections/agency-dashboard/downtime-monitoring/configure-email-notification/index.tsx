import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmailItemContent from './email-item-content';
import type {
	MonitorSettingsEmail,
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

import './style.scss';

interface Props {
	defaultEmailAddresses: Array< string >;
	toggleModal: ( item?: StateMonitorSettingsEmail, action?: AllowedMonitorContactActions ) => void;
	addedEmailAddresses?: Array< MonitorSettingsEmail >;
	allEmailItems: Array< StateMonitorSettingsEmail >;
	setAllEmailItems: ( emailAddresses: Array< StateMonitorSettingsEmail > ) => void;
}

export default function ConfigureEmailNotification( {
	defaultEmailAddresses = [],
	toggleModal,
	addedEmailAddresses = [], // FIXME: This value will come from the API.
	allEmailItems,
	setAllEmailItems,
}: Props ) {
	const translate = useTranslate();

	useEffect( () => {
		if ( defaultEmailAddresses ) {
			const defaultEmailItems = defaultEmailAddresses.map( ( email ) => ( {
				email,
				name: 'Default Email', //FIXME: This should be dynamic.
				isDefault: true,
				verified: true,
			} ) );
			setAllEmailItems( [ ...defaultEmailItems, ...addedEmailAddresses ] );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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
