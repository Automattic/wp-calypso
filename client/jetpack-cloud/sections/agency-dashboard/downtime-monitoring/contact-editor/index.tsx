import { useContext, useEffect } from 'react';
import DashboardModal from '../../dashboard-modal';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	Site,
} from '../../sites-overview/types';
import { useContactModalTitleAndSubtitle } from './hooks';
import RemoveContactForm from './remove';
import { ContactInfo } from './types';
import { addToContactList, getContactInfoValue, removeFromContactList } from './utils';
import VerifyContactForm from './verify';

type Props< T > = {
	type: AllowedMonitorContactTypes;
	action?: AllowedMonitorContactActions;
	selectedContact?: T;
	contacts: Array< T >;
	setContacts: ( contacts: Array< T > ) => void;
	setVerifiedContact: ( item: string ) => void;
	recordEvent: ( action: string, params?: object ) => void;
	onClose: () => void;
	sites: Array< Site >;
};

export default function ContactEditor< T extends Partial< ContactInfo > >( {
	type,
	action = 'add',
	onClose,
	selectedContact,
	contacts,
	setContacts,
	recordEvent,
	setVerifiedContact,
	sites,
}: Props< T > ) {
	const { title, subtitle } = useContactModalTitleAndSubtitle( type, action );
	const { verifiedContacts } = useContext( DashboardDataContext );

	// Refetch verified contacts if failed
	useEffect( () => {
		verifiedContacts.refetchIfFailed();
		// Disable linting because we only want to refetch once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const onAddContact = ( contact: T, asVerified: boolean, sourceEvent?: string ) => {
		if ( sourceEvent ) {
			recordEvent( sourceEvent );
		}

		setContacts( addToContactList< T >( type, contacts, contact, asVerified ) );
		setVerifiedContact( getContactInfoValue( type, contact ) );

		onClose();
	};

	const onRemoveContact = ( contact: T ) => {
		if ( type === 'email' ) {
			recordEvent( `downtime_monitoring_remove_email` );
		} else if ( type === 'sms' ) {
			recordEvent( `downtime_monitoring_remove_phone_number` );
		}

		setContacts( removeFromContactList< T >( type, contacts, contact ) );
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
