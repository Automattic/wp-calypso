import { Card, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

import './style.scss';

interface EmailItem {
	email: string;
	name: string;
	checked: boolean;
}
interface Props {
	defaultEmailAddresses: Array< string >;
	toggleModal: () => void;
}

export default function ConfigureEmailNotification( {
	defaultEmailAddresses = [],
	toggleModal,
}: Props ) {
	const translate = useTranslate();

	const [ allEmailItems, setAllEmailItems ] = useState< EmailItem[] >( [] );

	useEffect( () => {
		if ( defaultEmailAddresses ) {
			const allEmailItems = defaultEmailAddresses.map( ( email, index ) => ( {
				email,
				checked: index === 0, // FIXME: This should be dynamic.
				name: 'Default Email', //FIXME: This should be dynamic.
			} ) );
			setAllEmailItems( allEmailItems );
		}
	}, [ defaultEmailAddresses ] );

	const handleOnChange = () => {
		if ( defaultEmailAddresses.length === 1 ) {
			return;
			// FIXME: We need to show a custom error message here.
		}
		// FIXME: Onselect of checkbox, we need to update the state of the checkbox.
	};

	const getCheckboxContent = ( item: EmailItem ) => (
		<span className="configure-email-address__checkbox-content">
			<div className="configure-email-address__checkbox-heading">{ item.email }</div>
			<div className="configure-email-address__checkbox-sub-heading">{ item.name }</div>
		</span>
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
