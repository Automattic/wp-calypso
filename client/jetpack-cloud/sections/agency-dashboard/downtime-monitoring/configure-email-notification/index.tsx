import { Card, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { Icon, plus, pencil } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Badge from 'calypso/components/badge';
import type { MonitorSettingsEmail } from '../../sites-overview/types';

import './style.scss';

interface StateEmailItem extends MonitorSettingsEmail {
	checked: boolean;
	isDefault?: boolean;
}
interface Props {
	defaultEmailAddresses: Array< string >;
	toggleModal: () => void;
	addedEmailAddresses?: Array< MonitorSettingsEmail >;
}

export default function ConfigureEmailNotification( {
	defaultEmailAddresses = [],
	toggleModal,
	addedEmailAddresses = [], // FIXME: This value will come from the API.
}: Props ) {
	const translate = useTranslate();

	const [ allEmailItems, setAllEmailItems ] = useState< StateEmailItem[] >( [] );

	useEffect( () => {
		if ( defaultEmailAddresses ) {
			const defaultEmailItems = defaultEmailAddresses.map( ( email ) => ( {
				email,
				name: 'Default Email', //FIXME: This should be dynamic.
				checked: true,
				isDefault: true,
				verified: true,
			} ) );
			const addedEmailItems = addedEmailAddresses.map( ( email ) => ( {
				...email,
				checked: email.verified, // Checked only if the email is verified.
			} ) );
			setAllEmailItems( [ ...defaultEmailItems, ...addedEmailItems ] );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const handleOnChange = () => {
		if ( defaultEmailAddresses.length === 1 ) {
			return;
			// FIXME: We need to show a custom error message here.
		}
		// FIXME: Onselect of checkbox, we need to update the state of the checkbox.
	};

	const showVerified = true; // FIXME: This should be dynamic.

	const getCheckboxContent = ( item: StateEmailItem ) => (
		<div className="configure-email-address__checkbox-content-container">
			<span className="configure-email-address__checkbox-content">
				<div className="configure-email-address__checkbox-heading">{ item.email }</div>
				<div className="configure-email-address__checkbox-sub-heading">{ item.name }</div>
			</span>
			{ ! item.isDefault && (
				<>
					{ ! item.verified && (
						<span className="configure-email-address__verification-status">
							<Badge type="warning">{ translate( 'Pending Verification' ) }</Badge>
						</span>
					) }
					{ showVerified && item.verified && (
						<span className="configure-email-address__verification-status">
							<Badge type="success">{ translate( 'Verified' ) }</Badge>
						</span>
					) }
					<span className="configure-email-address__edit-icon">
						<Icon size={ 18 } icon={ pencil } />
					</span>
				</>
			) }
		</div>
	);

	return (
		<div className="configure-email-address__card-container">
			{ allEmailItems.map( ( item ) => (
				<Card className="configure-email-address__card" key={ item.email } compact>
					<CheckboxControl
						className="configure-email-address__checkbox"
						checked={ item.checked }
						onChange={ handleOnChange }
						label={ getCheckboxContent( item ) }
					/>
				</Card>
			) ) }
			<Button
				compact
				className="configure-email-address__button"
				onClick={ toggleModal }
				aria-label={ translate( 'Add email address' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add email address' ) }
			</Button>
		</div>
	);
}
