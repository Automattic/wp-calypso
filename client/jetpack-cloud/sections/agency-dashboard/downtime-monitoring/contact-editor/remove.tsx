import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DashboardModalFormFooter from '../../dashboard-modal-form/footer';
import { AllowedMonitorContactTypes } from '../../sites-overview/types';
import ContactListItem, { ContactListItemType } from '../contact-list/item';

type Props< T > = {
	contact: T;
	onCancel: () => void;
	onRemove: ( contact: T ) => void;
	type: AllowedMonitorContactTypes;
};

export default function RemoveContactForm< T >( {
	contact,
	onCancel,
	onRemove,
	type,
}: Props< T > ) {
	const translate = useTranslate();

	const handleOnRemove = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		onRemove( contact );
	};

	return (
		<form onSubmit={ handleOnRemove }>
			<div className="margin-top-16">
				<ContactListItem type={ type } item={ contact as ContactListItemType } />
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
