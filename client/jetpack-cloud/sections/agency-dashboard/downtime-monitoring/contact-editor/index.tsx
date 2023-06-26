import { useContext, useEffect } from 'react';
import DashboardModal from '../../dashboard-modal';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	Site,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import { useContactModalTitleAndSubtitle } from '../hooks';
import RemoveContactForm from './remove';
import { addToContactList, removeFromContactList } from './utils';
import VerifyContactForm from './verify';

type Props = {
	type: AllowedMonitorContactTypes;
	action?: AllowedMonitorContactActions;
	selectedContact?: StateMonitorSettingsEmail | StateMonitorSettingsSMS;
	contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >;
	setContacts: ( contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS > ) => void;
	setVerifiedContact: ( item: string ) => void;
	recordEvent: ( action: string, params?: object ) => void;
	onClose: () => void;
	sites: Array< Site >;
};

export default function ContactEditor( {
	type,
	action = 'add',
	onClose,
	selectedContact,
	contacts,
	setContacts,
	recordEvent,
	setVerifiedContact,
	sites,
}: Props ) {
	const { title, subtitle } = useContactModalTitleAndSubtitle( type, action );
	const { verifiedContacts } = useContext( DashboardDataContext );

	// Refetch verified contacts if failed
	useEffect( () => {
		verifiedContacts.refetchIfFailed();
		// Disable linting because we only want to refetch once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const onAddContact = (
		contact: StateMonitorSettingsEmail | StateMonitorSettingsSMS,
		asVerified: boolean,
		sourceEvent?: string
	) => {
		if ( sourceEvent ) {
			recordEvent( sourceEvent );
		}

		setContacts( addToContactList( type, contacts, contact, asVerified ) );

		if ( type === 'email' ) {
			setVerifiedContact( ( contact as StateMonitorSettingsEmail ).email );
		}

		if ( type === 'sms' ) {
			setVerifiedContact( ( contact as StateMonitorSettingsSMS ).phoneNumberFull );
		}

		onClose();
	};

	const onRemoveContact = ( contact: StateMonitorSettingsEmail | StateMonitorSettingsSMS ) => {
		if ( type === 'email' ) {
			recordEvent( `downtime_monitoring_remove_email` );
		} else if ( type === 'sms' ) {
			recordEvent( `downtime_monitoring_remove_phone_number` );
		}

		setContacts( removeFromContactList( type, contacts, contact ) );
		onClose();
	};

	return (
		<DashboardModal
			title={ title }
			subtitle={ subtitle }
			onClose={ onClose }
			shouldCloseOnClickOutside={ false }
		>
			{ action === 'remove' ? (
				selectedContact && (
					<RemoveContactForm
						contact={ selectedContact }
						onRemove={ onRemoveContact }
						onCancel={ onClose }
						type={ type }
					/>
				)
			) : (
				<VerifyContactForm
					action={ action }
					contact={ selectedContact }
					contacts={ contacts }
					onAdd={ onAddContact }
					onClose={ onClose }
					recordEvent={ recordEvent }
					sites={ sites }
					type={ type }
				/>
			) }
		</DashboardModal>
	);
}
