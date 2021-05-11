/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { getHttpData, DataState } from 'calypso/state/data-layer/http-data';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getRequestUnauthorizedSiteId, requestUnauthorizedSite } from 'calypso/state/data-getters';
import JetpackLogo from 'calypso/components/jetpack-logo';
interface Props {
	site: number | string;
	productSlug: string;
}

const UserlessJetpackThankYou: FunctionComponent< Props > = ( {
	site: siteFragment,
	productSlug,
} ) => {
	const translate = useTranslate();

	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const {
		// state: requestState,
		data: { name, URL },
		// error: requestError,
	} = useSelector( () => getHttpData( getRequestUnauthorizedSiteId( siteFragment ) ) );

	// const loadingActivity = ! [ DataState.Success, DataState.Failure ].includes( requestState );

	useEffect( () => {
		requestUnauthorizedSite( siteFragment );
	}, [ siteFragment ] );

	return (
		<Card>
			<JetpackLogo full={ true } />
			<h2>
				{ translate( 'Thank you for your purchase!' ) }
				{ String.fromCodePoint( 0x1f389 ) }
				{ /* Celebration emoji 🎉 */ }
			</h2>
			{ product && (
				<p>
					{ translate( '%(productName)s was added to your site %(siteName)s.', {
						args: {
							siteName: name,
							productName: product.name,
						},
					} ) }
				</p>
			) }
			<Button href={ URL }>
				{ translate( 'Back to %(siteName)s', {
					args: name,
				} ) }
			</Button>
		</Card>
	);
};

export default UserlessJetpackThankYou;
