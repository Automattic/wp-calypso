/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { Button } from '@automattic/components';

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="payment-method-list">
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method-list__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<div className="payment-method-list__body">
				<Button onClick={ () => page( '/partner-portal/payment-method/add' ) }>
					{ translate( 'Add credit card' ) }
				</Button>
			</div>
		</Main>
	);
}
