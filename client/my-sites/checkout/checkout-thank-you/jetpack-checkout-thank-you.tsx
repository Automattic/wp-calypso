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
import { getHttpData, DataState, requestHttpData } from 'calypso/state/data-layer/http-data';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import JetpackLogo from 'calypso/components/jetpack-logo';
import QueryProducts from 'calypso/components/data/query-products-list';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import Main from 'calypso/components/main';

interface Props {
	site: number | string;
	productSlug: string;
}

const getRequestUnauthorizedSiteId = ( siteId: string | number ): string =>
	`unauthorized-site:${ siteId }`;

const requestUnauthorizedSite = ( siteId: string | number ) =>
	requestHttpData(
		getRequestUnauthorizedSiteId( siteId ),
		http(
			{
				apiVersion: '1.2',
				method: 'GET',
				path: `/sites/${ siteId }`,
			},
			{}
		),
		{
			fromApi: () => ( data ) => {
				return [ [ getRequestUnauthorizedSiteId( siteId ), data ] ];
			},
			freshness: -Infinity,
		}
	);

const JetpackCheckoutThankYou: FunctionComponent< Props > = ( {
	site: siteFragment,
	productSlug,
} ) => {
	const translate = useTranslate();

	const productName = useSelector( ( state ) => getProductName( state, productSlug ) ) as
		| string
		| null;
	const isProductListFetching = useSelector( ( state ) =>
		getIsProductListFetching( state )
	) as boolean;

	const {
		state: requestState,
		data: { name, URL } = { name: null, URL: null },
		// error: requestError,
	} = useSelector( () => getHttpData( getRequestUnauthorizedSiteId( siteFragment ) ) );

	const isLoading =
		! [ DataState.Success, DataState.Failure ].includes( requestState ) || isProductListFetching;

	useEffect( () => {
		requestUnauthorizedSite( siteFragment );
	}, [ siteFragment ] );

	return (
		<Main className="jetpack-checkout-thank-you">
			<Card className="jetpack-checkout-thank-you__card">
				<JetpackLogo full size={ 45 } />
				<QueryProducts type="jetpack" />
				<h2 className="jetpack-checkout-thank-you__main-message">
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ translate( 'Thank you for your purchase!' ) }{ ' ' }
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</h2>
				<p
					className={
						isLoading
							? 'jetpack-checkout-thank-you__sub-message-loading'
							: 'jetpack-checkout-thank-you__sub-message'
					}
				>
					{ translate( '%(productName)s was added to your site %(siteName)s.', {
						args: {
							siteName: name,
							productName: productName,
						},
					} ) }
				</p>
				<Button
					className="jetpack-checkout-thank-you__button"
					disabled={ isLoading }
					href={ URL }
					primary
				>
					{ isLoading
						? translate( 'loading' )
						: translate( 'Back to %s', {
								args: name,
						  } ) }
				</Button>
			</Card>
		</Main>
	);
};

export default JetpackCheckoutThankYou;
