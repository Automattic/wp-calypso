/**
 * MCP Sites — Site exceptions page
 * Legacy port of: client/dashboard/me/mcp/sites/index.tsx
 */
import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { CompactCard } from '@automattic/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ComboboxControl,
	Button,
	Spinner,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import LegacySectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { ActionList } from '../../dashboard/components/action-list';
import { Card, CardBody } from '../../dashboard/components/card';
import { SectionHeader } from '../../dashboard/components/section-header';
import { getDisabledSiteIds } from './utils';

import './style.scss';

const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

function getSiteDisplayName( site ) {
	return site.name || site.URL?.replace( /^https?:\/\//, '' ) || String( site.ID );
}

export default function McpSites( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: sites = [] } = useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );
	const { data: userSettings } = useQuery( userSettingsQuery() );

	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	const isSquareCorners = variation === 'F' || variation === 'G';
	const isLegacyStyle = variation === 'F';

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site ? getSiteDisplayName( site ) : `Site ID: ${ siteId }`;
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		const iconUrl = site?.icon?.img || site?.icon?.ico || null;
		return { id: siteId, name, domain, iconUrl };
	} );

	// Track whether the last mutation was an "add" action (for spinner placement)
	const isAddingRef = useRef( false );

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			tanstackQueryClient.setQueryData( userSettingsQuery().queryKey, newData );
			reduxDispatch(
				successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), {
					id: 'mcp-settings-error',
				} )
			);
		},
	} );

	// ComboboxControl options — exclude already-excepted sites.
	const siteOptions = sites
		.filter( ( site ) => ! disabledSiteIds.includes( site.ID ) )
		.map( ( site ) => ( {
			value: String( site.ID ),
			label: getSiteDisplayName( site ),
		} ) );

	const handleSiteSelect = ( value ) => {
		if ( ! value ) {
			return;
		}
		const siteId = Number( value );
		if ( isNaN( siteId ) ) {
			return;
		}
		isAddingRef.current = true;
		if ( document.activeElement ) {
			document.activeElement.blur();
		}
		mutation.mutate( {
			mcp_abilities: {
				sites: [ { blog_id: siteId, account_tools_enabled: false } ],
			},
		} );
	};

	const handleRemoveSite = ( siteId ) => {
		isAddingRef.current = false;
		mutation.mutate( {
			mcp_abilities: {
				sites: [ { blog_id: siteId, account_tools_enabled: true } ],
			},
		} );
	};

	return (
		<Main wideLayout className="mcp-sites">
			<PageViewTracker path={ path } title="MCP Sites" />
			<DocumentHead title={ translate( 'External AI access exceptions' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI assistants interact with your WordPress.com account and sites.'
				) }
			/>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'External AI access exceptions' ) }
			</HeaderCake>
			{ isLegacyStyle ? (
				<>
					<LegacySectionHeader label={ translate( 'Add an exception' ) }>
						{ mutation.isPending && isAddingRef.current && (
							<Spinner style={ { width: 16, height: 16, margin: 0 } } />
						) }
					</LegacySectionHeader>
					<Card isRounded={ false }>
						<CardBody>
							<VStack spacing={ 4 }>
								<p style={ { color: '#646970', margin: 0, fontSize: '14px' } }>
									{ translate( 'Search for sites to disable external AI access.' ) }
								</p>
								<ComboboxControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ translate( 'Search sites' ) }
									hideLabelFromVision
									value={ null }
									onChange={ handleSiteSelect }
									options={ siteOptions }
									placeholder={ translate( 'Search for a site\u2026' ) }
								/>
							</VStack>
						</CardBody>
					</Card>

					{ disabledSites.length > 0 && (
						<>
							<LegacySectionHeader
								label={ translate( 'Restricted sites' ) }
								className="mcp__section-header"
							/>
							<CompactCard>
								<p style={ { color: '#646970', margin: 0, fontSize: '14px' } }>
									{ translate( 'These sites will not have MCP access.' ) }
								</p>
							</CompactCard>
							{ disabledSites.map( ( site ) => (
								<CompactCard key={ site.id } className="mcp__site-row">
									{ site.iconUrl ? (
										<img
											className="mcp__site-row-icon"
											src={ site.iconUrl }
											alt=""
											width={ 36 }
											height={ 36 }
										/>
									) : (
										<span className="mcp__site-row-icon mcp__site-row-icon--fallback">
											{ site.name.charAt( 0 ) }
										</span>
									) }
									<div className="mcp__site-row-info">
										{ site.name }
										<small>{ site.domain }</small>
									</div>
									<Button
										variant="secondary"
										size="compact"
										disabled={ mutation.isPending }
										onClick={ () => handleRemoveSite( site.id ) }
									>
										{ translate( 'Remove' ) }
									</Button>
								</CompactCard>
							) ) }
						</>
					) }
				</>
			) : (
				<VStack spacing={ 6 }>
					<Card
						isRounded={ ! isSquareCorners }
						style={ isSquareCorners ? { borderRadius: 0 } : undefined }
					>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ translate( 'Add an exception' ) }
									description={ translate( 'Search for sites to disable external AI access.' ) }
									actions={
										mutation.isPending && isAddingRef.current ? (
											<Spinner style={ { width: 16, height: 16, margin: 0 } } />
										) : undefined
									}
								/>

								<ComboboxControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ translate( 'Search sites' ) }
									hideLabelFromVision
									value={ null }
									onChange={ handleSiteSelect }
									options={ siteOptions }
									placeholder={ translate( 'Search for a site\u2026' ) }
								/>
							</VStack>
						</CardBody>
					</Card>

					{ disabledSites.length > 0 && (
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'Restricted sites' ) }
								description={ translate( 'These sites will not have MCP access.' ) }
							/>
							{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
							<div className={ isSquareCorners ? 'mcp-square-corners' : undefined }>
								<style>{ '.mcp-square-corners .action-list { border-radius: 0; }' }</style>
								<ActionList>
									{ disabledSites.map( ( site ) => (
										<ActionList.ActionItem
											key={ site.id }
											title={ site.name }
											description={ site.domain }
											actions={
												<Button
													variant="secondary"
													size="compact"
													disabled={ mutation.isPending }
													onClick={ () => handleRemoveSite( site.id ) }
												>
													{ translate( 'Remove' ) }
												</Button>
											}
										/>
									) ) }
								</ActionList>
							</div>
						</VStack>
					) }
				</VStack>
			) }
		</Main>
	);
}
