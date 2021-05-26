/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

export default function PaymentMethod(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="payment-method">
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<Card className="payment-method__body">
				<CardHeading size={ 24 }>{ translate( 'Credit card details' ) }</CardHeading>
			</Card>
		</Main>
	);
}
