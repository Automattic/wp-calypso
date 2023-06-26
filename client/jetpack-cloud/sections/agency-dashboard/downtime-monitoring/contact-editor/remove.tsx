import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DashboardModalFormFooter from '../../dashboard-modal-form/footer';
import {
	AllowedMonitorContactTypes,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import ContactListItem from '../contact-list/item';

type Props = {
	contact: StateMonitorSettingsEmail | StateMonitorSettingsSMS;
	onCancel: () => void;
	onRemove: ( contact: StateMonitorSettingsEmail | StateMonitorSettingsSMS ) => void;
	type: AllowedMonitorContactTypes;
};

export default function RemoveContactForm( { contact, onCancel, onRemove, type }: Props ) {
	const translate = useTranslate();

	const handleOnRemove = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		onRemove( contact );
	};

	return (
		<form onSubmit={ handleOnRemove }>
			<div className="margin-top-16">
				<ContactListItem type={ type } item={ contact } />
			</div>
			<DashboardModalFormFooter>
				<Button onClick={ onCancel }>{ translate( 'Back' ) }</Button>
				<Button type="submit" primary>
					{ translate( 'Remove' ) }
				</Button>
			</DashboardModalFormFooter>
		</form>
	);
}
