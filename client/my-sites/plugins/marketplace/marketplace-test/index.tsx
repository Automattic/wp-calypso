/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import { Button, Card, CompactCard } from '@automattic/components';
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

export const Container = styled.div`
	margin: 0 25px;
	padding: 25px;
`;

function level1ObjectMap( obj: any, entryFilter = ( [ i ]: any[] ) => i ): any[] {
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
	const yoastPluginOnSite = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'wordpress-seo-premium' )
	);
	const contactFormPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'contact-form-7' )
	);

	const [ infiniteLoopCount, setInfiniteLoopCount ] = useState( 0 );

	const dispatch = useDispatch();
	const transferDetails = useSelector( ( state ) => getAutomatedTransfer( state, selectedSiteId ) );
	const eligibilityDetails = useSelector( ( state ) => getEligibility( state, selectedSiteId ) );
	const marketplacePages = [
		{ name: 'Plugin Details Page', path: '/marketplace/product/details/wordpress-seo' },
		{ name: 'Loading Page', path: '/marketplace/product/setup' },
		{ name: 'Domains Page', path: '/marketplace/domain' },
		{ name: 'Thank You Page', path: '/marketplace/thank-you' },
	];

	//Infinite Loop
	useEffect( () => {
		if ( selectedSiteId ) {
			setTimeout( () => {
				dispatch( fetchAutomatedTransferStatus( selectedSiteId ) );
				dispatch( requestEligibility( selectedSiteId ) );
				setInfiniteLoopCount( ( l ) => l + 1 );
			}, 4000 );
		}
	}, [ infiniteLoopCount, selectedSite, dispatch, selectedSiteId ] );

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
				<CardHeading tagName="h1" size={ 24 }>
					Marketplace Test Page
				</CardHeading>
				<CardHeading tagName="h1" size={ 24 }>
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
						Transfer Details
						<div>
							selector:<strong>transferDetails</strong>
						</div>
						<div>
							dispatch:<strong>fetchAutomatedTransferStatus</strong>
						</div>
					</CardHeading>
					<div>keys: { Object.keys( transferDetails ).join( ', ' ) }</div>
					{ level1ObjectMap( transferDetails, ( [ key ] ) => key !== 'eligibility' ).map(
						( entry, i ) => (
							<div key={ i }>
								{ entry.key } : { entry.value }
							</div>
						)
					) }
					<CardHeading tagName="h1" size={ 21 }>
						Eligibility Details
						<div>
							selector:<strong>getEligibility</strong>
						</div>
						<div>
							dispatch:<strong>fetchAutomatedTransferStatus</strong>
						</div>
					</CardHeading>
					{ level1ObjectMap( eligibilityDetails ).map( ( entry, i ) => (
						<div key={ i }>
							{ entry.key } : { entry.value }
						</div>
					) ) }
				</Card>
				<CompactCard>
					<CardHeading tagName="h1" size={ 21 }>
						Warnings
					</CardHeading>
					<WarningList
						warnings={ transferDetails?.eligibility?.eligibilityWarnings ?? [] }
						context="plugins"
						translate={ translate }
					/>
				</CompactCard>
				<CompactCard>
					<CardHeading tagName="h1" size={ 21 }>
						Blocking Messages
					</CardHeading>
					{ hasHardBlock &&
						raisedBlockingMessages.map( ( message ) => (
							<Notice
								status={ message.status }
								text={ message.message }
								showDismiss={ false }
							></Notice>
						) ) }
				</CompactCard>
			</Card>
			<Card key="installed-plugins">
				<Card>
					<CardHeading tagName="h1" size={ 21 }>
						Plugin Statuses : selector : getPluginOnSite
						<div>
							selector : isRequestingForSite : { JSON.stringify( { isRequestingForSite } ) }
						</div>
					</CardHeading>
					<Card>
						Yoast plugin Query : Type of - { typeof yoastPluginOnSite }
						{ yoastPluginOnSite &&
							level1ObjectMap( yoastPluginOnSite ).map( ( { key, value } ) => (
								<div key={ key }>
									{ key } : { value }
								</div>
							) ) }
					</Card>
					<Card>
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
		</Container>
	);
}
