import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

export default function AddStoredCreditCard(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const navigateToCreateMethod = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_empty_issue_license_click' )
		);
	};

	return (
		<a
			className="add-stored-credit-card"
			href="/partner-portal/payment-methods/add"
			onClick={ navigateToCreateMethod }
		>
			<div className="add-stored-credit-card__content">
				<CardHeading className="add-stored-credit-card__title" tagName="h3">
					<Gridicon key="add-card-icon" icon="add-outline" size={ 24 } />
					<span key="add-card-text">{ translate( 'New credit card' ) }</span>
				</CardHeading>
			</div>
		</a>
	);
}
