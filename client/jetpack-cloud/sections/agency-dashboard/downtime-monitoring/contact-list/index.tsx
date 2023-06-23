import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
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

	return (
		<>
			{ items.length === 0 && (
				<div className="margin-top-16">
					<AlertBanner type="warning">
						{ type === 'email'
							? translate( 'You need at least one email address' )
							: translate( 'You need at least one phone number' ) }
					</AlertBanner>
				</div>
			) }

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

				<Button compact className="contact-list__button" onClick={ onAddContact }>
					<Icon size={ 18 } icon={ plus } />
					{ type === 'email' ? translate( 'Add email address' ) : translate( 'Add phone number' ) }
				</Button>
			</div>
		</>
	);
}
