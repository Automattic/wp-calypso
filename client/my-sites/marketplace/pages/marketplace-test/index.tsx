/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { Button, Card, CompactCard } from '@automattic/components';
import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	fetchAutomatedTransferStatus,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import { getAutomatedTransfer, getEligibility } from 'calypso/state/automated-transfer/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { WarningList } from 'calypso/blocks/eligibility-warnings/warning-list';
import {
	getPluginOnSite,
	getPlugins,
	isRequestingForSites,
} from 'calypso/state/plugins/installed/selectors';
import { getBlockingMessages } from 'calypso/blocks/eligibility-warnings/hold-list';
import { isAtomicSiteWithoutBusinessPlan } from 'calypso/blocks/eligibility-warnings/utils';
import Notice from 'calypso/components/notice';
import ComponentDemo from 'calypso/my-sites/marketplace/pages/marketplace-test/component-demo';
import AdminMenuFetch from 'calypso/my-sites/marketplace/pages/marketplace-test/admin-menu-fetch';
import { YOAST } from 'calypso/my-sites/marketplace/marketplace-product-definitions';

export const Container = styled.div`
	margin: 0 25px;
	padding: 25px;
`;

export function level1ObjectMap(
	obj: ArrayLike< unknown >,
	entryFilter = ( [ i ]: unknown[] ) => i
): unknown[] {
	return Object.entries( obj )
		.filter( entryFilter )
		.map( ( entry ) => ( { key: entry[ 0 ], value: JSON.stringify( entry[ 1 ] ) } ) );
}

export default function MarketplaceTest(): JSX.Element {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isAtomicSite = useSelector( ( state ) => isSiteWpcomAtomic( state, selectedSiteId ?? 0 ) );
	const pluginDetails = useSelector( ( state ) => getPlugins( state, [ selectedSiteId ] ) );

	const isRequestingForSite = useSelector( ( state ) =>
		isRequestingForSites( state, [ selectedSiteId ] )
	);
	const yoastPremiumPluginOnSite = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'wordpress-seo-premium' )
	);
	const yoastFreePluginOnSite = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'wordpress-seo' )
	);
	const contactFormPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'contact-form-7' )
	);

	const dispatch = useDispatch();
	const transferDetails = useSelector( ( state ) => getAutomatedTransfer( state, selectedSiteId ) );
	const eligibilityDetails = useSelector( ( state ) => getEligibility( state, selectedSiteId ) );
	const marketplacePages = [
		{
			name: 'Yoast Premium Details Page',
			path: `/marketplace/product/details/${ YOAST }/${ YOAST_PREMIUM }`,
		},
		{
			name: 'Yoast Free Details Page',
			path: `/marketplace/product/details/${ YOAST }/${ YOAST_FREE }`,
		},
		{ name: 'Loading Page', path: '/marketplace/product/setup' },
		{ name: 'Domains Page', path: '/marketplace/domain' },
		{ name: 'Thank You Page', path: '/marketplace/thank-you' },
	];

	useEffect( () => {
		selectedSiteId && dispatch( fetchAutomatedTransferStatus( selectedSiteId ) );
		selectedSiteId && dispatch( requestEligibility( selectedSiteId ) );
	}, [ dispatch, selectedSiteId ] );

	const refreshTransferDetails = () => {
		selectedSiteId && dispatch( fetchAutomatedTransferStatus( selectedSiteId ) );
		selectedSiteId && dispatch( requestEligibility( selectedSiteId ) );
	};

	const { ID, URL, domain, options = {} } = selectedSite;
	const { is_wpcom_atomic, is_automated_transfer } = options;

	const allBlockingMessages = getBlockingMessages( translate );
	const holds = eligibilityDetails.eligibilityHolds || [];
	const raisedBlockingMessages = holds
		.filter( ( message: any ) => allBlockingMessages[ message ] )
		.map( ( message: string ) => allBlockingMessages[ message ] );
	const hardBlockSingleMessages = holds.filter(
		( message: string ) => message !== 'TRANSFER_ALREADY_EXISTS' || ! allBlockingMessages[ message ]
	);
	const hasHardBlock =
		isAtomicSiteWithoutBusinessPlan( holds ) || hardBlockSingleMessages.length > 0;
	return (
		<Container>
			{ selectedSiteId && <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> }
			<SidebarNavigation />
			<Card key="heading">
				<CardHeading key="title" tagName="h1" size={ 24 }>
					Marketplace Test Page
				</CardHeading>
				<CardHeading key="site-details" tagName="h1" size={ 24 }>
					<div>Current Site : { selectedSite?.domain }</div>
				</CardHeading>
			</Card>
			<Card key="navigation-links">
				{ marketplacePages.map( ( p ) => {
					const path = `${ p.path }/${ selectedSiteSlug }`;
					return (
						<Button key={ p.path } onClick={ () => page( path ) }>
							{ p.name }
						</Button>
					);
				} ) }
			</Card>
			<Card key="important-state">
				<Card key="site-information">
					<CardHeading tagName="h1" size={ 21 }>
						Selected Site details selector <strong>getSelectedSite</strong>
					</CardHeading>
					<div>ID : { ID }</div>
					<div>URL : { URL }</div>
					<div>domain : { domain }</div>
					<div>options.is_wpcom_atomic : { is_wpcom_atomic?.toString() }</div>
					<div>options.is_automated_transfer : { is_automated_transfer?.toString() }</div>
					<div>selector : isSiteWpcomAtomic : { isAtomicSite?.toString() }</div>
					<div>selector : getSelectedSiteId : { selectedSiteId }</div>
					<div>selector : getSelectedSiteSlug : { selectedSiteSlug }</div>
				</Card>
				<Card key="transfer-information">
					<CardHeading tagName="h1" size={ 21 }>
						Transfer Details <Button onClick={ refreshTransferDetails }>Refresh</Button>
						<div key="selector">
							selector:<strong>transferDetails</strong>
						</div>
						<div key="dispatch">
							dispatch:<strong>fetchAutomatedTransferStatus</strong>
						</div>
					</CardHeading>
					<div>keys: { Object.keys( transferDetails ).join( ', ' ) } </div>
					{ level1ObjectMap( transferDetails, ( [ key ] ) => key !== 'eligibility' ).map(
						( entry, i ) => (
							<div key={ i }>
								{ entry.key } : { entry.value }
							</div>
						)
					) }
					<CardHeading tagName="h1" size={ 21 }>
						Eligibility Details
						<div key="selector">
							selector:<strong>getEligibility</strong>
						</div>
						<div key="dispatch">
							dispatch:<strong>fetchAutomatedTransferStatus</strong>
						</div>
					</CardHeading>
					{ level1ObjectMap( eligibilityDetails ).map( ( entry, i ) => (
						<div key={ i }>
							{ entry.key } : { entry.value }
						</div>
					) ) }
				</Card>
				<CompactCard key="warnings">
					<CardHeading key="title" tagName="h1" size={ 21 }>
						Warnings
					</CardHeading>
					<WarningList
						warnings={ transferDetails?.eligibility?.eligibilityWarnings ?? [] }
						context="plugins"
						translate={ translate }
					/>
				</CompactCard>
				<CompactCard key="blocking-messages">
					<CardHeading tagName="h1" size={ 21 }>
						Blocking Messages
					</CardHeading>
					{ hasHardBlock &&
						raisedBlockingMessages.map( ( message ) => (
							<Notice
								key={ message.message }
								status={ message.status }
								text={ message.message }
								showDismiss={ false }
							/>
						) ) }
				</CompactCard>
			</Card>
			<Card key="installed-plugins">
				<Card>
					<CardHeading tagName="h1" size={ 21 }>
						Plugin Statuses : selector : getPluginOnSite
						<div key="details">
							selector : isRequestingForSite : { JSON.stringify( { isRequestingForSite } ) }
						</div>
					</CardHeading>
					<Card key="yoast-premium">
						Yoast Premium plugin Query : Type of yoastPremiumPluginOnSite -
						{ typeof yoastPremiumPluginOnSite }
						{ yoastPremiumPluginOnSite &&
							level1ObjectMap( yoastPremiumPluginOnSite ).map( ( { key, value } ) => (
								<div key={ key }>
									{ key } : { value }
								</div>
							) ) }
					</Card>

					<Card key="yoast-free">
						Yoast Free plugin Query : Type of yoastFreePluginOnSite -
						{ typeof yoastFreePluginOnSite }
						{ yoastFreePluginOnSite &&
							level1ObjectMap( yoastFreePluginOnSite ).map( ( { key, value } ) => (
								<div key={ key }>
									{ key } : { value }
								</div>
							) ) }
					</Card>
					<Card key="contact-form">
						Contact Form plugin Query: Type of - { typeof contactFormPlugin }
						{ contactFormPlugin &&
							level1ObjectMap( contactFormPlugin ).map( ( { key, value } ) => (
								<div key={ key }>
									{ key } : { value }
								</div>
							) ) }
					</Card>
				</Card>
				<CardHeading tagName="h1" size={ 21 }>
					3rd Party Plugins Installed
				</CardHeading>
				{ pluginDetails &&
					pluginDetails
						.filter( ( plugin ) => plugin.author !== 'Automattic' )
						.map( ( details ) => (
							<Card key={ details.id }>
								<em>keys: { Object.keys( details ).join( ', ' ) }</em>
								{ level1ObjectMap(
									details,
									( [ key ] ) =>
										! [ 'description', 'network', 'autoupdate', 'version' ].includes( key )
								).map( ( { key, value } ) => (
									<div key={ key }>
										{ key } : { value }
									</div>
								) ) }
							</Card>
						) ) }
			</Card>
			<ComponentDemo />
			<AdminMenuFetch />
		</Container>
	);
}
