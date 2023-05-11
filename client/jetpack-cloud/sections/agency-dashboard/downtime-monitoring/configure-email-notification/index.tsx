import { Card, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { Icon, plus, pencil } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Badge from 'calypso/components/badge';
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

	const handleOnChange = ( item: StateMonitorSettingsEmail, checked: boolean ) => {
		if ( item.isDefault ) {
			return;
			// FIXME: We need to show a custom error message here or a tooltip.
		}
		if ( ! item.verified ) {
			return;
			// FIXME: We can open the verification modal here.
		}
		const updatedEmailItems = allEmailItems.map( ( emailItem ) => {
			if ( emailItem.email === item.email ) {
				return {
					...emailItem,
					checked,
				};
			}
			return emailItem;
		} );
		setAllEmailItems( updatedEmailItems );
	};

	const showVerified = true; // FIXME: This should be dynamic.

	const handleToggleModal = (
		item: StateMonitorSettingsEmail,
		action: AllowedMonitorContactActions
	) => {
		toggleModal( item, action );
	};

	const getCheckboxContent = ( item: StateMonitorSettingsEmail ) => (
		<div className="configure-email-address__checkbox-content-container">
			<span className="configure-email-address__checkbox-content">
				<div className="configure-email-address__checkbox-heading">{ item.email }</div>
				<div className="configure-email-address__checkbox-sub-heading">{ item.name }</div>
			</span>
			{ ! item.isDefault && (
				<>
					{ ! item.verified && (
						<span
							role="button"
							tabIndex={ 0 }
							onKeyPress={ () => handleToggleModal( item, 'verify' ) }
							onClick={ () => handleToggleModal( item, 'verify' ) }
							className="configure-email-address__verification-status cursor-pointer"
						>
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
						onChange={ ( checked ) => handleOnChange( item, checked ) }
						label={ getCheckboxContent( item ) }
					/>
				</Card>
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
