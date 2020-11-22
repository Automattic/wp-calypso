/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import CardHeading from 'calypso/components/card-heading';

/**
 * Style dependencies
 */
import './style.scss';

export default function PaymentMethodSidebar( { purchase } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return (
		<React.Fragment>
			{ renderMainCard( purchase, translate, moment ) }

			<Card className="payment-method-sidebar__security-card">
				<CardHeading
					tagName="h1"
					size={ 16 }
					isBold={ true }
					className="payment-method-sidebar__title"
				>
					{ translate( 'Security' ) }
				</CardHeading>
				<p className="payment-method-sidebar__paragraph">
					{ translate(
						'Your payment details are safe. We will transfer them over an encrypted connection and store them on a certified payment processing server.'
					) }
				</p>
			</Card>
		</React.Fragment>
	);
}

function renderMainCard( purchase, translate, moment ) {
	if ( purchase ) {
		const purchaseMessaging = purchase.renewDate
			? translate( 'Next payment on %s', { args: moment( purchase.renewDate ).format( 'LL' ) } )
			: translate( 'Expires on %s', { args: moment( purchase.expiryDate ).format( 'LL' ) } );

		return (
			<Card className="payment-method-sidebar__details-card">
				<CardHeading
					tagName="h1"
					size={ 16 }
					isBold={ true }
					className="payment-method-sidebar__title"
				>
					{ translate( 'Purchase Details' ) }
				</CardHeading>

				<p className="payment-method-sidebar__paragraph">
					{ purchase.productName } <br />
					<span className="payment-method-sidebar__date">{ purchaseMessaging }</span>
				</p>
			</Card>
		);
	}

	return (
		<Card className="payment-method-sidebar__details-card">
			<CardHeading
				tagName="h1"
				size={ 16 }
				isBold={ true }
				className="payment-method-sidebar__title"
			>
				{ translate( 'Usage' ) }
			</CardHeading>

			<p className="payment-method-sidebar__paragraph">
				{ translate( 'This card will be used for future renewals of existing purchases.' ) }
			</p>
		</Card>
	);
}

PaymentMethodSidebar.propTypes = {
	purchase: PropTypes.object,
};
