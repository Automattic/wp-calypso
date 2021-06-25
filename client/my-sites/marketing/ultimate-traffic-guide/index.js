/**
 * External dependencies
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';
import { Button, CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { getProductCost, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { isFetchingUserPurchases, getUserPurchases } from 'calypso/state/purchases/selectors';
import { getCurrentUserCurrencyCode, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isTrafficGuide, WPCOM_TRAFFIC_GUIDE } from '@automattic/calypso-products';

/**
 * Style dependencies
 */
import './style.scss';

export const hasTrafficGuidePurchase = ( purchases ) =>
	!! ( purchases && purchases.find( ( purchase ) => isTrafficGuide( purchase ) ) );

export const downloadTrafficGuide = () => {
	window.location.href = 'https://public-api.wordpress.com/wpcom/v2/traffic-guide-download';
};

export default function UltimateTrafficGuide() {
	const translate = useTranslate();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isLoading = useSelector( ( state ) => isFetchingUserPurchases( state ) );
	const purchases = useSelector( ( state ) => getUserPurchases( state, userId ) );
	const hasPurchase = hasTrafficGuidePurchase( purchases );

	const renderContent = () => {
		return (
			<>
				<PageViewTracker
					path={ '/marketing/ultimate-traffic-guide' }
					title={ 'Ultimate Traffic Guide' }
					properties={ { has_purchase: hasPurchase } }
				/>
				{ hasPurchase ? (
					<DownloadPage translate={ translate } />
				) : (
					<SalesPage translate={ translate } />
				) }
			</>
		);
	};

	return (
		<CompactCard className="ultimate-traffic-guide">
			{ ! purchases && <QueryUserPurchases userId={ userId } /> }
			{ isLoading || ! purchases ? <Placeholder num={ 5 } /> : renderContent() }
		</CompactCard>
	);
}

const Placeholder = ( { num = 1 } ) =>
	[ ...Array( num ) ].map( ( e, i ) => (
		<div key={ `${ i }` } className="ultimate-traffic-guide__placeholder">
			<div className="ultimate-traffic-guide__placeholder-animation"></div>
		</div>
	) );

const SalesPage = ( { translate } ) => {
	const cost = useSelector( ( state ) => getProductCost( state, WPCOM_TRAFFIC_GUIDE ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	/**
	 * The reference cost is calculated to the nearest 100
	 */
	const referenceCost = Math.floor( ( cost * 7 ) / 100 ) * 100;

	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	const displayReferenceCost = formatCurrency( referenceCost, currencyCode, { stripZeros: true } );

	const cta = () => (
		<p>
			<Button href={ `/checkout/${ siteSlug }/${ WPCOM_TRAFFIC_GUIDE }` } primary>
				{ translate( 'Click here to buy the guide now!' ) }
			</Button>
		</p>
	);

	return (
		<>
			<h1 className="ultimate-traffic-guide__header">
				{ translate( 'Introducing the WordPress.com Ultimate Traffic Guide' ) }
			</h1>
			<h2 className="ultimate-traffic-guide__sub-header">
				{ translate( 'Discover today’s most important traffic secrets' ) }
			</h2>
			<p>
				{ translate(
					'We developed this 96 page guide to teach you every modern website traffic trick you need to know in %(currentYear)s and beyond.',
					{
						args: { currentYear: new Date().getFullYear() },
					}
				) }
			</p>
			<p>
				{ translate(
					'Here are just a few of the topics we cover in {{i}}The Ultimate Traffic Guide:{{/i}}',
					{
						components: {
							i: <i />,
						},
					}
				) }
			</p>
			<p>
				<strong>{ translate( 'The complete SEO checklist for your website (page 53)' ) }</strong>
				<br></br>
				{ translate(
					'Following this simple 7-step checklist will help you get your site featured at the top of search engine results for your most important keywords (and help you avoid the most common pitfalls that you absolutely must avoid if you want to rank well).'
				) }
			</p>
			<p>
				<strong>
					{ translate(
						'Why email is STILL a must-have marketing channel (hint: it’s simple, free, and effective) (page 88)'
					) }
				</strong>
				<br></br>
				{ translate(
					'This guide will teach you everything you need to know: from which email marketing tools you should use, to how to collect email addresses and write great subject lines, and more.'
				) }
			</p>
			<p>
				<strong>
					{ translate( 'Harness the power of social media to expand your reach (page 65)' ) }
				</strong>
				<br></br>
				{ translate(
					'Discover the best ways to leverage social media channels like FaceBook, Twitter, and LinkedIn to connect with your audience and turn them into raving fans.'
				) }
			</p>
			<p>
				<strong>
					{ translate(
						'How to build a simple “traffic magnet” to instantly attract the right audience (page 7)'
					) }
				</strong>
				<br></br>
				{ translate(
					'It’s so effective you don’t even have to come close to a “perfect” site before you launch… even the ugliest site can drive an endless stream of business if you get this right!'
				) }
			</p>
			{ isLoading ? (
				<Placeholder />
			) : (
				<p>
					{ translate(
						'If you’ve spent any time looking for marketing help, you know that marketing guides like this often cost %(referenceCost)s or more. But you won’t have to pay anywhere near that amount.',
						{
							args: { referenceCost: displayReferenceCost },
						}
					) }
				</p>
			) }

			{ isLoading ? (
				<Placeholder />
			) : (
				<p>
					<strong>
						{ translate(
							'In fact, if you act today you’ll pay just %(cost)s for The Ultimate Traffic Guide.',
							{
								args: { cost: displayCost },
							}
						) }
					</strong>
				</p>
			) }

			{ cta() }
		</>
	);
};

const DownloadPage = ( { translate } ) => {
	return (
		<>
			<p>
				{ translate(
					// eslint-disable-next-line inclusive-language/use-inclusive-words
					'Congratulations for taking this important step towards mastering the art of online marketing! To download your copy of The Ultimate Traffic Guide, simply click the button below and confirm the download prompt.'
				) }
			</p>
			<p>
				{ translate(
					'{{i}}The Ultimate Traffic Guide{{/i}} is a goldmine of traffic tips and how-tos that reveals the exact “Breakthrough Traffic” process we’ve developed over the past decade.',
					{
						components: {
							i: <i />,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'We’ve done all the hard work for you. We’ve sifted through an ocean of marketing articles, tested the ideas to see if they actually work, and then distilled the very best ideas into this printable guide.'
				) }
			</p>
			<p>
				<Button onClick={ () => downloadTrafficGuide() } primary>
					{ translate( 'Click here to download your copy now.' ) }
				</Button>
			</p>
		</>
	);
};
