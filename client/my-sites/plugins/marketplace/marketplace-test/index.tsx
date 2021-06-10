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
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	fetchAutomatedTransferStatus,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { WarningList } from 'calypso/blocks/eligibility-warnings/warning-list';
// import { getPlugins, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import { getBlockingMessages } from 'calypso/blocks/eligibility-warnings/hold-list';
import { isAtomicSiteWithoutBusinessPlan } from 'calypso/blocks/eligibility-warnings/utils';

import Notice from 'calypso/components/notice';

export const Container = styled.div`
	margin: 0 25px;
	padding: 25px;
`;

export default function MarketplaceTest() {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite ) || {};
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isAtomicSite = useSelector( ( state ) => isSiteWpcomAtomic( state, selectedSiteId ?? 0 ) );
	// This selector is not working need to investigate why that is
	// const pluginDetails = useSelector( ( state ) => getPlugins( state, selectedSiteId ) );
	const pluginDetails = useSelector(
		( state ) => state.plugins.installed.plugins[ selectedSiteId ]
	);
	const [ infiniteLoopCount, setInfiniteLoopCount ] = useState( 0 );
	const marketplacePages = [
		{ name: 'Plugin Details Page', path: '/marketplace/product/details/wordpress-seo' },
		{ name: 'Loading Page', path: '/marketplace/product/setup' },
		{ name: 'Domains Page', path: '/marketplace/domain' },
		{ name: 'Thank You Page', path: '/marketplace/thank-you' },
	];
	const dispatch = useDispatch();
	const transferDetails = useSelector( ( state ) =>
		getAutomatedTransfer( state, selectedSite?.ID ?? 0 )
	);

	//Infinite Loop
	useEffect( () => {
		setTimeout( () => {
			dispatch( fetchAutomatedTransferStatus( selectedSite?.ID ?? 0 ) );
			dispatch( requestEligibility( selectedSite?.ID ?? 0 ) );
			setInfiniteLoopCount( ( l ) => l + 1 );
		}, 4000 );
	}, [ infiniteLoopCount, fetchAutomatedTransferStatus, selectedSite ] );

	const { ID, URL, domain, options = {} } = selectedSite;
	const { is_wpcom_atomic, is_automated_transfer } = options;

	const allBlockingMessages = getBlockingMessages( translate );
	const holds = transferDetails?.eligibility?.eligibilityHolds || [];
	const raisedBlockingMessages = holds
		.filter( ( message: string ) => allBlockingMessages[ message ] )
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
					const path = `${ p.path }${ selectedSite?.domain ? `/${ selectedSite.domain }` : '' }`;
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
					{ Object.entries( transferDetails ).map( ( entry, i ) => (
						<div key={ i }>
							{ JSON.stringify( entry[ 0 ] ) } : { JSON.stringify( entry[ 1 ] ) }
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
				<CardHeading tagName="h1" size={ 21 }>
					3rd Party Plugins Installed
				</CardHeading>
				{ pluginDetails &&
					pluginDetails
						.filter( ( plugin ) => plugin.author !== 'Automattic' )
						.map( ( details ) => (
							<Card key={ details.id }>
								{ Object.entries( details )
									.filter(
										( [ key ] ) =>
											! [ 'description', 'network', 'autoupdate', 'version', 'id' ].includes( key )
									)
									.map( ( [ key, value ] ) => (
										<div key={ key }>
											{ key } : { JSON.stringify( value ) }
										</div>
									) ) }
							</Card>
						) ) }
			</Card>
		</Container>
	);
}
