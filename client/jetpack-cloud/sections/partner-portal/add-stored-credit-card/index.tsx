/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
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
	};

	return (
		<a
			className="add-stored-credit-card"
			href="/partner-portal/payment-method/add"
			onClick={ navigateToCreateMethod }
		>
			<div className="add-stored-credit-card__content">
				<CardHeading className="add-stored-credit-card__title" tagName="h3">
					<Gridicon key="add-card-icon" icon="add-outline" size={ 24 } />
					<span key="add-card-text">{ translate( 'New Credit Card' ) }</span>
				</CardHeading>

				<Button>{ translate( 'Add new credit card' ) }</Button>
			</div>
		</a>
	);
}
