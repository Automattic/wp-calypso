import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { getSiteDisplayName } from '../../dashboard/utils/site-name';
import { getSiteDisplayUrl } from '../../dashboard/utils/site-url';
import { useMcpPageChrome } from './mcp-page-header';
import McpSiteCombobox from './mcp-site-combobox';
import { getAccountMcpAbilities, getEnabledSiteIds, hasEnabledAccountTools } from './utils';

import './style.scss';

export default function McpAddSitePage( { path } ) {
	const translate = useTranslate();
	const { documentTitle, navigationHeaderProps } = useMcpPageChrome();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	const { data: sites = [], error: sitesError } = useQuery(
		sitesQuery( 'all', { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const { data: userSettings, error: userSettingsError } = useQuery( userSettingsQuery() );

	const [ comboboxValue, setComboboxValue ] = useState( '' );
	const [ reauthRequired, setReauthRequired ] = useState( false );

	useEffect( () => {
		const checkReauth = () => setReauthRequired( twoStepAuthorization.isReauthRequired() );
		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth();
		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] );

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( userSettingsQuery().queryKey, newData );
			dispatch( successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } ) );
			setComboboxValue( '' );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const hasTools = Object.keys( mcpAbilities ).length > 0;
	const accountMcpOn = hasEnabledAccountTools( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const enabledSites = useMemo( () => {
		return enabledSiteIds
			.map( ( siteId ) => {
				const site = sites.find( ( s ) => s.ID === siteId );
				if ( site ) {
					return {
						id: siteId,
						site,
						name: getSiteDisplayName( site ),
						domain: getSiteDisplayUrl( site ),
						slug: site.slug,
					};
				}
				return {
					id: siteId,
					site: null,
					name: sprintf(
						/* translators: %s is the site ID. */
						translate( 'Site ID: %s' ),
						String( siteId )
					),
					domain: '',
					slug: null,
				};
			} )
			.sort( ( a, b ) => a.name.localeCompare( b.name ) );
	}, [ enabledSiteIds, sites, translate ] );

	const comboboxOptions = useMemo( () => {
		const enabledSet = new Set( enabledSiteIds );
		return sites
			.filter( ( site ) => ! enabledSet.has( site.ID ) )
			.map( ( site ) => ( {
				value: String( site.ID ),
				label: getSiteDisplayName( site ),
				site,
			} ) );
	}, [ sites, enabledSiteIds ] );

	const handleComboboxChange = ( siteIdStr ) => {
		setComboboxValue( siteIdStr || '' );
		if ( ! siteIdStr ) {
			return;
		}
		const blogId = Number( siteIdStr );
		if ( isNaN( blogId ) ) {
			return;
		}
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: blogId,
						site_level_enabled: true,
					},
				],
			},
		} );
	};

	const handleRemoveSite = ( siteId ) => {
		mutation.mutate( {
			mcp_abilities: {
				sites: [
					{
						blog_id: siteId,
						site_level_enabled: false,
					},
				],
			},
		} );
	};

	if ( userSettingsError || sitesError ) {
		return null;
	}

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<Main wideLayout className="mcp mcp-add-site">
			<PageViewTracker path={ path } title="MCP — Add to a site" />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'Add MCP to specific sites' ) }
			</HeaderCake>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! reauthRequired && (
				<VStack spacing={ 10 } alignment="stretch">
					{ ! hasTools && (
						<Text variant="muted" as="p">
							{ translate( 'No MCP tools are available for your account yet.' ) }
						</Text>
					) }

					{ hasTools && accountMcpOn && (
						<Card>
							<CardBody>
								<VStack spacing={ 3 }>
									<Text as="p">
										{ translate(
											'MCP access is already enabled for your account. To choose which sites are excluded, use Site exceptions.'
										) }
									</Text>
									<HStack spacing={ 3 }>
										<Button variant="primary" href="/me/mcp/mcp-sites">
											{ translate( 'Site exceptions' ) }
										</Button>
										<Button variant="secondary" href="/me/mcp">
											{ translate( 'Back to AI and MCP' ) }
										</Button>
									</HStack>
								</VStack>
							</CardBody>
						</Card>
					) }

					{ hasTools && ! accountMcpOn && (
						<>
							<Card>
								<CardBody>
									<VStack spacing={ 3 }>
										<SectionHeader
											level={ 3 }
											title={ translate( 'Add a site' ) }
											description={ translate( 'Search for a site to enable MCP access.' ) }
										/>
										<McpSiteCombobox
											options={ comboboxOptions }
											value={ comboboxValue }
											onChange={ handleComboboxChange }
											disabled={ mutation.isPending || comboboxOptions.length === 0 }
											label={ translate( 'Search for a site to enable MCP' ) }
										/>
										{ sites.length === 0 && (
											<Text variant="muted" as="p">
												{ translate( `You don't have any visible sites yet.` ) }
											</Text>
										) }
										{ sites.length > 0 && comboboxOptions.length === 0 && (
											<Text variant="muted" as="p">
												{ translate( 'Every site you manage is already listed below.' ) }
											</Text>
										) }
									</VStack>
								</CardBody>
							</Card>

							{ enabledSites.length > 0 && (
								<VStack spacing={ 5 } alignment="stretch">
									<SectionHeader
										level={ 3 }
										title={ translate( 'Enabled sites' ) }
										description={ translate( 'These sites have MCP access enabled.' ) }
									/>
									<Card>
										<CardBody>
											<VStack spacing={ 6 } alignment="stretch">
												{ enabledSites.map( ( { id, site, name, domain, slug } ) => (
													<HStack
														key={ id }
														justify="space-between"
														alignment="center"
														spacing={ 4 }
													>
														<HStack spacing={ 3 } alignment="left">
															{ site && <SiteIcon site={ site } size={ 40 } /> }
															<FlexItem isBlock>
																<VStack spacing={ 1 } alignment="stretch">
																	<Text as="div" weight={ 600 } size={ 14 } lineHeight={ 1.4 }>
																		{ name }
																	</Text>
																	{ domain && (
																		<Text variant="muted" as="div" size={ 12 } lineHeight={ 1.4 }>
																			{ domain }
																		</Text>
																	) }
																</VStack>
															</FlexItem>
														</HStack>
														<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
															{ slug && (
																<Button
																	variant="link"
																	size="compact"
																	href={ `/sites/${ slug }/settings/ai-tools` }
																>
																	{ translate( 'Manage' ) }
																</Button>
															) }
															<Button
																variant="secondary"
																size="compact"
																disabled={ mutation.isPending }
																onClick={ () => handleRemoveSite( id ) }
															>
																{ translate( 'Remove' ) }
															</Button>
														</HStack>
													</HStack>
												) ) }
											</VStack>
										</CardBody>
									</Card>
								</VStack>
							) }
						</>
					) }
				</VStack>
			) }
		</Main>
	);
}
