/**
 * EXPLORATION FILE — Disposable UI for trying different options.
 * Original file: index.tsx (untouched)
 *
 * Toggle between variations using the "Explorations" menu
 * that appears next to the DEV badge (bottom-right of screen).
 *
 * Option 1 — Baseline: Current screen (everything on one page, all toggles visible)
 * Option 2 — Hub: Master toggle + summary cards linking to sub-pages (matches Security pattern)
 * Option 3 — Hub (copy of Option 2)
 */
import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	__experimentalHStack as HStack,
	FormTokenField,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { connection, lock, unseen } from '@wordpress/icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getSiteAccountToolsEnabled,
} from '../../../me/mcp/utils';
import Breadcrumbs from '../../app/breadcrumbs';
import { useAppContext } from '../../app/context';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import { getSiteDisplayName } from '../../utils/site-name';
import { CATEGORY_ORDER, getDisplayCategory } from './categories';
import type { Site } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

// ─── Exploration Options ────────────────────────────────────────────────────

const VARIATIONS = [
	{ key: 'A', label: 'Option 1 — Baseline' },
	{ key: 'B', label: 'Option 2 — Hub' },
	{ key: 'C', label: 'Option 3 — Hub (copy)' },
] as const;

type VariationKey = ( typeof VARIATIONS )[ number ][ 'key' ];

// ─── Explorations Menu (injected into DEV badge) ────────────────────────────

function ExplorationsMenuContent( {
	current,
	onChange,
}: {
	current: VariationKey;
	onChange: ( v: VariationKey ) => void;
} ) {
	return (
		<>
			<div>Explorations</div>
			<div className="explorations-helper__menu">
				{ VARIATIONS.map( ( v ) => {
					const isActive = v.key === current;
					return (
						<div
							key={ v.key }
							className={ `explorations-helper__item${ isActive ? ' is-active' : '' }` }
							onClick={ () => onChange( v.key ) }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									onChange( v.key );
								}
							} }
							role="button"
							tabIndex={ 0 }
						>
							{ v.label }
							{ isActive ? ' •' : '' }
						</div>
					);
				} ) }
			</div>
		</>
	);
}

function useExplorationsHelper( current: VariationKey, onChange: ( v: VariationKey ) => void ) {
	const rootRef = useRef< ReturnType< typeof import('react-dom/client').createRoot > | null >(
		null
	);

	useEffect( () => {
		let disposed = false;
		let retryTimer: ReturnType< typeof setTimeout >;

		const injectStyles = () => {
			if ( document.querySelector( '#explorations-helper-styles' ) ) {
				return;
			}
			const style = document.createElement( 'style' );
			style.id = 'explorations-helper-styles';
			style.textContent = `
				.explorations-helper__menu {
					display: none;
					background: #fff;
					box-shadow: 0 0 0 1px #dcdcde;
					padding: 8px 0;
					max-height: 80vh;
					overflow-y: auto;
					position: absolute;
					bottom: 100%;
					right: 0;
					margin: 0;
					font-size: 12px;
					min-width: 180px;
					z-index: 1001;
				}
				.environment.is-explorations:hover .explorations-helper__menu {
					display: block;
				}
				.explorations-helper__item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 6px 12px;
					cursor: pointer;
					white-space: nowrap;
					text-transform: none;
					font-weight: 400;
					color: #3c434a;
					line-height: 18px;
				}
				.explorations-helper__item:hover {
					background: #f0f0f0;
				}
				.explorations-helper__item.is-active {
					font-weight: 700;
				}
			`;
			document.head.appendChild( style );
		};

		const mount = () => {
			if ( disposed ) {
				return;
			}
			const badge = document.querySelector( '.environment-badge' );
			if ( ! badge ) {
				retryTimer = setTimeout( mount, 300 );
				return;
			}

			injectStyles();

			let el = badge.querySelector( '.environment.is-explorations' ) as HTMLElement | null;
			if ( ! el ) {
				el = document.createElement( 'div' );
				el.className = 'environment is-explorations';
				el.textContent = 'Explorations';
				const devLabel = badge.querySelector( '.is-env' );
				if ( devLabel ) {
					badge.insertBefore( el, devLabel );
				} else {
					badge.appendChild( el );
				}
			}

			import( 'react-dom/client' ).then( ( { createRoot } ) => {
				if ( disposed ) {
					return;
				}
				if ( ! rootRef.current && el ) {
					rootRef.current = createRoot( el );
				}
				rootRef.current?.render(
					<ExplorationsMenuContent current={ current } onChange={ onChange } />
				);
			} );
		};

		mount();

		return () => {
			disposed = true;
			clearTimeout( retryTimer );
			if ( rootRef.current ) {
				rootRef.current.unmount();
				rootRef.current = null;
			}
			const badge = document.querySelector( '.environment-badge' );
			const el = badge?.querySelector( '.environment.is-explorations' );
			if ( el ) {
				el.remove();
			}
			const styleEl = document.querySelector( '#explorations-helper-styles' );
			if ( styleEl ) {
				styleEl.remove();
			}
		};
	}, [ current, onChange ] );

	useEffect( () => {
		const handler = ( e: KeyboardEvent ) => {
			const tag = ( e.target as HTMLElement )?.tagName;
			if ( tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ) {
				return;
			}
			const num = parseInt( e.key, 10 );
			if ( num >= 1 && num <= VARIATIONS.length ) {
				onChange( VARIATIONS[ num - 1 ].key );
			}
		};
		document.addEventListener( 'keydown', handler );
		return () => document.removeEventListener( 'keydown', handler );
	}, [ onChange ] );
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: Record< string, unknown >;
}

// ─── Main Component ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'mcp-explore-variation';

function McpComponentExplore() {
	const [ variation, setVariation ] = useState< VariationKey >( () => {
		const stored = localStorage.getItem( STORAGE_KEY );
		return stored && VARIATIONS.some( ( v ) => v.key === stored )
			? ( stored as VariationKey )
			: 'A';
	} );
	const onChangeVariation = useCallback( ( v: VariationKey ) => {
		setVariation( v );
		localStorage.setItem( STORAGE_KEY, v );
	}, [] );
	useExplorationsHelper( variation, onChangeVariation );

	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const [ selectedSiteIds, setSelectedSiteIds ] = useState< number[] >( [] );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site
			? getSiteDisplayName( site )
			: /* translators: %s is the numeric site ID */
			  sprintf( __( 'Site ID: %s' ), String( siteId ) );
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		return { id: siteId, name, domain };
	} );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;
	const enabledToolsCount = Object.values( mcpAbilities ).filter( ( tool ) => tool.enabled ).length;
	const anyToolsEnabled = enabledToolsCount > 0;

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		mutation.mutate( { mcp_abilities: { account: { [ toolId ]: enabled } } } as any );
	};

	const handleToggleAll = ( enabled: boolean ) => {
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );
		mutation.mutate( { mcp_abilities: { account: accountAbilities } } as any );
	};

	const groupToolsByCategory = (
		tools: Array< [ string, McpAbility ] >
	): Record< string, Array< [ string, McpAbility ] > > => {
		const grouped: Record< string, Array< [ string, McpAbility ] > > = {};
		tools.forEach( ( [ toolId, tool ] ) => {
			const displayCategory = getDisplayCategory( toolId, tool );
			if ( ! grouped[ displayCategory ] ) {
				grouped[ displayCategory ] = [];
			}
			grouped[ displayCategory ].push( [ toolId, tool ] );
		} );
		return grouped;
	};

	const siteSuggestions = sites.map( ( site ) => {
		return `${ site.ID }|${ getSiteDisplayName( site ) }`;
	} );

	const selectedSiteTokens = selectedSiteIds.map( ( siteId ) => {
		const site = sites.find( ( s ) => s.ID === siteId );
		if ( ! site ) {
			return String( siteId );
		}
		return `${ siteId }|${ getSiteDisplayName( site ) }`;
	} );

	const displaySiteName = ( tokenValue: string ) => {
		const parts = tokenValue.split( '|' );
		return parts.length > 1 ? parts[ 1 ] : tokenValue;
	};

	const handleSiteTokensChange = ( tokens: ( string | { value: string; title?: string } )[] ) => {
		const tokenStrings = tokens.map( ( token ) =>
			typeof token === 'string' ? token : token.value
		);
		const newSiteIds = tokenStrings
			.map( ( token ) => {
				const parts = token.split( '|' );
				const siteId = Number( parts[ 0 ] );
				return isNaN( siteId ) ? undefined : siteId;
			} )
			.filter( ( id ): id is number => id !== undefined );
		setSelectedSiteIds( newSiteIds );
	};

	const handleAllSitesToggle = ( enabled: boolean ) => {
		const sitesPayload = selectedSiteIds.map( ( siteId ) => ( {
			blog_id: siteId,
			account_tools_enabled: enabled,
		} ) );
		const payload = {
			mcp_abilities: {
				...( sitesPayload.length > 0 && { sites: sitesPayload } ),
			},
		};
		mutation.mutate( payload as any );
	};

	const handleSiteToggle = ( siteId: number, enabled: boolean ) => {
		mutation.mutate( {
			mcp_abilities: { sites: [ { blog_id: siteId, account_tools_enabled: enabled } ] },
		} as any );
	};

	const allSelectedSitesEnabled =
		selectedSiteIds.length > 0
			? selectedSiteIds.every( ( siteId ) =>
					getSiteAccountToolsEnabled( userSettings || {}, siteId )
			  )
			: false;

	// ─── Shared: tools section with categories ───────────────────────

	const renderToolsSection = ( tools: Array< [ string, McpAbility ] > ) => {
		if ( ! tools || tools.length === 0 ) {
			return null;
		}
		const groupedTools = groupToolsByCategory( tools );
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'What the AI can access' ) }
							description={ __(
								'Control which parts of your account and sites the AI is allowed to use.'
							) }
						/>
						<VStack spacing={ 4 }>
							{ CATEGORY_ORDER.map( ( categoryName ) => {
								const categoryTools = groupedTools[ categoryName ];
								if ( ! categoryTools || categoryTools.length === 0 ) {
									return null;
								}
								return (
									<VStack key={ categoryName } spacing={ 4 }>
										<Text
											as="h4"
											size="11px"
											weight={ 500 }
											style={ { textTransform: 'uppercase' } }
										>
											{ categoryName }
										</Text>
										<VStack spacing={ 4 }>
											{ categoryTools.map( ( [ toolId, tool ]: [ string, McpAbility ] ) => (
												<ToggleControl
													key={ toolId }
													__nextHasNoMarginBottom
													checked={ tool.enabled }
													disabled={ mutation.isPending }
													label={ tool.title }
													help={ tool.description }
													onChange={ ( checked ) => handleToolChange( toolId, checked ) }
												/>
											) ) }
										</VStack>
									</VStack>
								);
							} ) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		);
	};

	// ─── Variation A: Baseline (exact copy of original) ─────────────

	const renderVariationA = () => {
		return (
			<VStack spacing={ 8 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="top">
								<SectionHeader
									level={ 3 }
									title={ __( 'AI Access' ) }
									description={ __(
										'Control what AI assistants can access your WordPress.com account and sites.'
									) }
								/>
								<VStack style={ { flexShrink: 0 } }>
									<RouterLinkButton
										to="/me/preferences/ai-and-mcp/setup"
										variant="secondary"
										disabled={ ! anyToolsEnabled }
									>
										{ __( 'Configure MCP Client' ) }
									</RouterLinkButton>
								</VStack>
							</HStack>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={
									<Text>
										{ anyToolsEnabled ? __( 'Disable AI Access' ) : __( 'Enable AI Access' ) }
									</Text>
								}
							/>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'Site-specific MCP settings' ) }
									description={ __(
										'Choose sites to manage AI access for all users on those sites. This overrides your account settings.'
									) }
								/>
								<FormTokenField
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Select sites to manage AI access' ) }
									value={ selectedSiteTokens }
									suggestions={ siteSuggestions }
									onChange={ handleSiteTokensChange }
									displayTransform={ displaySiteName }
									placeholder={ __( 'Type to search and select sites\u2026' ) }
									__experimentalShowHowTo={ false }
									__experimentalExpandOnFocus
								/>
								{ selectedSiteIds.length > 0 && (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allSelectedSitesEnabled }
										disabled={ mutation.isPending }
										onChange={ handleAllSitesToggle }
										label={
											<Text>
												{ allSelectedSitesEnabled
													? __( 'Disable AI access for selected sites' )
													: __( 'Enable AI access for selected sites' ) }
											</Text>
										}
									/>
								) }
								{ disabledSites.length > 0 && (
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ __( 'Sites with disabled MCP access' ) }
											description={ __(
												'Sites with disabled MCP access are not accessible to AI assistants.'
											) }
										/>
										<VStack spacing={ 2 }>
											{ disabledSites.map( ( site ) => (
												<ToggleControl
													key={ site.id }
													__nextHasNoMarginBottom
													checked={ false }
													disabled={ mutation.isPending }
													onChange={ ( enabled ) => handleSiteToggle( site.id, enabled ) }
													label={ site.name }
													help={ site.domain }
												/>
											) ) }
										</VStack>
									</VStack>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				{ hasTools && renderToolsSection( availableTools ) }
			</VStack>
		);
	};

	// ─── Variation B: Hub-and-spoke (summary cards → sub-pages) ─────
	// Matches the Security hub pattern: master toggle at top,
	// then RouterLinkSummaryButton cards that link to dedicated sub-pages.

	const renderVariationB = () => {
		const toolsBadges: SummaryButtonBadgeProps[] = [
			{
				text:
					enabledToolsCount === availableTools.length
						? __( 'All enabled' )
						: sprintf(
								/* translators: %1$d is number of enabled tools, %2$d is total tools */
								__( '%1$d of %2$d enabled' ),
								enabledToolsCount,
								availableTools.length
						  ),
				intent: enabledToolsCount === availableTools.length ? 'success' : 'default',
			},
		];

		const sitesBadges: SummaryButtonBadgeProps[] = [
			{
				text:
					disabledSiteIds.length === 0
						? __( 'No restrictions' )
						: sprintf(
								/* translators: %d is number of restricted sites */
								__( '%d restricted' ),
								disabledSiteIds.length
						  ),
				intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
			},
		];

		return (
			<VStack spacing={ 6 }>
				{ /* Master toggle card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'AI Access' ) }
								description={ __(
									'Allow AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ __( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* Summary cards — only shown when AI access is on */ }
				{ hasTools && anyToolsEnabled && (
					<>
						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/tools"
							title={ __( 'MCP access' ) }
							description={ __(
								'Control what your AI assistant can do on your account and sites.'
							) }
							decoration={ <Icon icon={ lock } /> }
							badges={ toolsBadges }
						/>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/setup"
							title={ __( 'Connect AI assistant' ) }
							description={ __( 'Get instructions for connecting your AI assistant.' ) }
							decoration={ <Icon icon={ connection } /> }
						/>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/sites"
							title={ __( 'Site restrictions' ) }
							description={ __( 'Restrict AI access for specific sites.' ) }
							decoration={ <Icon icon={ unseen } /> }
							badges={ sitesBadges }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation C: Hub (copy of Option 2) ────────────────────────

	const renderVariationC = () => {
		const toolsBadgesC: SummaryButtonBadgeProps[] = [
			{
				text:
					enabledToolsCount === availableTools.length
						? __( 'All enabled' )
						: sprintf(
								/* translators: %1$d is number of enabled tools, %2$d is total tools */
								__( '%1$d of %2$d enabled' ),
								enabledToolsCount,
								availableTools.length
						  ),
				intent: enabledToolsCount === availableTools.length ? 'success' : 'default',
			},
		];

		const sitesBadgesC: SummaryButtonBadgeProps[] = [
			{
				text:
					disabledSiteIds.length === 0
						? __( 'No restrictions' )
						: sprintf(
								/* translators: %d is number of restricted sites */
								__( '%d restricted' ),
								disabledSiteIds.length
						  ),
				intent: disabledSiteIds.length === 0 ? 'default' : 'warning',
			},
		];

		return (
			<VStack spacing={ 6 }>
				{ /* Master toggle card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'AI Access' ) }
								description={ __(
									'Allow AI assistants to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleToggleAll }
								label={ __( 'Enable AI access' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* Summary cards — only shown when AI access is on */ }
				{ hasTools && anyToolsEnabled && (
					<>
						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/tools"
							title={ __( 'MCP access' ) }
							description={ __(
								'Control what your AI assistant can do on your account and sites.'
							) }
							decoration={ <Icon icon={ lock } /> }
							badges={ toolsBadgesC }
						/>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/setup"
							title={ __( 'Connect AI assistant' ) }
							description={ __( 'Get instructions for connecting your AI assistant.' ) }
							decoration={ <Icon icon={ connection } /> }
						/>

						<RouterLinkSummaryButton
							to="/me/preferences/ai-and-mcp/sites"
							title={ __( 'Site restrictions' ) }
							description={ __( 'Restrict AI access for specific sites.' ) }
							decoration={ <Icon icon={ unseen } /> }
							badges={ sitesBadgesC }
						/>
					</>
				) }
			</VStack>
		);
	};

	// ─── Variation Router ───────────────────────────────────────────

	const renderCurrentVariation = () => {
		switch ( variation ) {
			case 'A':
				return renderVariationA();
			case 'B':
				return renderVariationB();
			case 'C':
				return renderVariationC();
			default:
				return renderVariationA();
		}
	};

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI and MCP' ) }
					description={ createInterpolateElement(
						__(
							'Control how AI assistants interact with your WordPress.com account and sites. <learnMoreLink/>'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="mcp" />,
						}
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			{ renderCurrentVariation() }
		</PageLayout>
	);
}

export default McpComponentExplore;
