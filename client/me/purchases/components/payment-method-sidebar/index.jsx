import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

export default function PaymentMethodSidebar( { purchase } ) {
	const translate = useTranslate();

	return (
		<Fragment>
			<MainCard purchase={ purchase } />

			<Card className="payment-method-sidebar__security-card">
				<CardHeading tagName="h1" size={ 16 } isBold className="payment-method-sidebar__title">
					{ translate( 'Security' ) }
				</CardHeading>
				<p className="payment-method-sidebar__paragraph">
					{ translate(
						'Your payment details are safe. We will transfer them over an encrypted connection and store them on a certified payment processing server.'
					) }
				</p>
			</Card>
		</Fragment>
	);
}

function MainCard( { purchase } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( purchase ) {
		const purchaseMessaging = purchase.renewDate
			? translate( 'Next payment on %s', { args: moment( purchase.renewDate ).format( 'LL' ) } )
			: translate( 'Expires on %s', { args: moment( purchase.expiryDate ).format( 'LL' ) } );

		return (
			<Card className="payment-method-sidebar__details-card">
				<CardHeading tagName="h1" size={ 16 } isBold className="payment-method-sidebar__title">
					{ translate( 'Purchase Details' ) }
				</CardHeading>

				<p className="payment-method-sidebar__paragraph">
					{ purchase.productName } <br />
					<span className="payment-method-sidebar__date">{ purchaseMessaging }</span>
				</p>
			</Card>
		);
	}

	return null;
}

PaymentMethodSidebar.propTypes = {
	purchase: PropTypes.object,
};
