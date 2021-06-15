/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

export default function AddStoredCreditCard(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const navigateToCreateMethod = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_empty_issue_license_click' )
		);

		page( '/partner-portal/payment-method/add' );
	};

	return (
		<div
			className="add-stored-credit-card"
			onClick={ navigateToCreateMethod }
			onKeyDown={ navigateToCreateMethod }
			role="button"
			tabIndex={ 0 }
		>
			<div className="add-stored-credit-card__content">
				<CardHeading className="add-stored-credit-card__text" size={ 18 }>
					{ translate( 'Add new credit card' ) }
				</CardHeading>
				<Gridicon className="add-stored-credit-card__icon" icon="add-outline" size={ 48 } />
			</div>
		</div>
	);
}
