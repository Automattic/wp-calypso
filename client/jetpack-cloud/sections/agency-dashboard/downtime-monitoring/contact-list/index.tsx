import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import AlertBanner from 'calypso/components/jetpack/alert-banner';
import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import ContactListItem from './item';
import { getContactActionEventName, getContactItemValue } from './utils';

import './style.scss';

export type Props = {
	items: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >;
	onAction: (
		item?: StateMonitorSettingsEmail | StateMonitorSettingsSMS,
		action?: AllowedMonitorContactActions
	) => void;
	recordEvent?: ( action: string, params?: object ) => void;
	type: AllowedMonitorContactTypes;
	verifiedItemKey?: string;
};

export default function ContactList( {
	items,
	onAction,
	recordEvent,
	type,
	verifiedItemKey,
}: Props ) {
	const translate = useTranslate();

	const onAddContact = () => {
		recordEvent?.( getContactActionEventName( type, 'add' ) );
		onAction?.();
	};

	const addButtonLabel = useMemo( () => {
		switch ( type ) {
			case 'email':
				return translate( 'Add email address' );
			case 'sms':
				return translate( 'Add phone number' );
			default:
				// Fail-safe incase we forgot to add handler for new type of contacts.
				return translate( 'Add contact' );
		}
	}, [ type, translate ] );

	const showAddButton = useMemo( () => {
		switch ( type ) {
			case 'sms':
				return items.length < 1;
			default:
				return true;
		}
	}, [ items.length, type ] );

	return (
		<>
			{ type === 'sms' && ! items.length && (
				<div className="margin-top-16">
					<AlertBanner type="warning">
						{ translate( 'You need at least one phone number' ) }
					</AlertBanner>
				</div>
			) }

			<div className="contact-list">
				{ items.map( ( item ) => (
					<ContactListItem
						type={ type }
						key={ getContactItemValue( type, item ) }
						item={ item }
						onAction={ onAction }
						recordEvent={ recordEvent }
						showVerifiedBadge={ getContactItemValue( type, item ) === verifiedItemKey }
					/>
				) ) }
				{ showAddButton && (
					<Button compact className="contact-list__button" onClick={ onAddContact }>
						<Icon size={ 18 } icon={ plus } />
						{ addButtonLabel }
					</Button>
				) }
			</div>
		</>
	);
}
