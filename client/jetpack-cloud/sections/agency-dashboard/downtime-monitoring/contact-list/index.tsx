import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	AllowedMonitorContactActions,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import ContactListItem from './contact-list-item';
import { getContactItemValue } from './utils';

import '.style.scss';

export type Props = {
	items: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >;
	onAction: (
		item?: StateMonitorSettingsEmail | StateMonitorSettingsSMS,
		action?: AllowedMonitorContactActions
	) => void;
	recordEvent?: ( action: string, params?: object ) => void;
	onAddContact: () => void;
	type: 'email' | 'phone';
	verifiedItemKey?: string;
};

export default function ContactList( {
	items,
	onAction,
	onAddContact,
	recordEvent,
	type,
	verifiedItemKey,
}: Props ) {
	const translate = useTranslate();

	return (
		<div className="contact-list">
			{ items.map( ( item: StateMonitorSettingsEmail | StateMonitorSettingsSMS ) => (
				<ContactListItem
					type={ type }
					key={ getContactItemValue( type, item ) }
					item={ item }
					onAction={ onAction }
					recordEvent={ recordEvent }
					showVerifiedBadge={ getContactItemValue( type, item ) === verifiedItemKey }
				/>
			) ) }

			<Button compact className="contact-list__add-button" onClick={ onAddContact }>
				<Icon size={ 18 } icon={ plus } />
				{ type === 'email' ? translate( 'Add email address' ) : translate( 'Add phone number' ) }
			</Button>
		</div>
	);
}
