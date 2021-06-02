/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { Card } from '@automattic/components';
import CreditCardEntryImage from 'calypso/jetpack-cloud/sections/partner-portal/components/credit-card-entry-image';
import CreditCardEntryForm from 'calypso/jetpack-cloud/sections/partner-portal/components/partner-portal-payment-credentials';
import JetpackStripeWrapper from 'calypso/jetpack-cloud/sections/partner-portal/components/jetpack-stripe-wrapper';

/**
 * Style dependencies
 */
import './style.scss';

export default function PaymentMethodAdd(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="payment-method-add">
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method-add__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<Card className="payment-method-add__body">
				<div className="payment-method-add__body-left">
					<Elements>
						<JetpackStripeWrapper />
					</Elements>
				</div>

				<div className="payment-method-add__body-right">
					<CreditCardEntryImage />
				</div>
			</Card>
		</Main>
	);
}
