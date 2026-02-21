/**
 * MCP Tools Category — Category detail page with tool toggles
 * Legacy port of: client/dashboard/me/mcp/tools/category.tsx
 *
 * Supports all rendering modes: default (B), accordion (E), toggle header (F/G).
 */
import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	PanelBody,
	Panel,
	Card,
	CardBody,
	CardDivider,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import {
	CATEGORY_ORDER,
	getDisplayCategory,
	getPermissionLevel,
	getPermissionLevelBySlug,
} from '../../dashboard/me/mcp/categories';
import { getAccountMcpAbilities } from './utils';

const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

export default function McpToolsCategory( { path, categorySlug } ) {
	const translate = useTranslate();
	const permissionLevel = getPermissionLevelBySlug( categorySlug );
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: userSettings } = useQuery( userSettingsQuery() );

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

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const allTools = Object.entries( mcpAbilities );

	// Options C–G merge Write + Manage into a single "Write" page.
	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	const isMergedWrite =
		[ 'C', 'D', 'E', 'F', 'G' ].includes( variation ) && categorySlug === 'write';

	// Filter to tools matching this permission level
	const tools = allTools.filter( ( [ , tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( isMergedWrite ) {
			return level === 'write' || level === 'manage';
		}
		return level === categorySlug;
	} );

	const handleToolChange = ( toolId, enabled ) => {
		mutation.mutate( { mcp_abilities: { account: { [ toolId ]: enabled } } } );
	};

	const handleSectionToggleAll = ( sectionTools, enabled ) => {
		const account = {};
		sectionTools.forEach( ( [ toolId ] ) => {
			account[ toolId ] = enabled;
		} );
		mutation.mutate( { mcp_abilities: { account } } );
	};

	// Group filtered tools by functional category
	const grouped = {};
	tools.forEach( ( [ toolId, tool ] ) => {
		const displayCategory = getDisplayCategory( toolId, tool );
		if ( ! grouped[ displayCategory ] ) {
			grouped[ displayCategory ] = [];
		}
		grouped[ displayCategory ].push( [ toolId, tool ] );
	} );

	// Entity normaliser for Option 6 dividers
	const getEntity = ( toolTitle ) => {
		const lower = toolTitle.toLowerCase();
		const withoutVerb = lower.replace(
			/^(search|get|list|create|update|delete|view|manage|set|activate|install|deactivate)\s+/,
			''
		);
		const withoutFiller = withoutVerb.replace( /\b(site|your|a|an|all)\s+/g, '' );
		const firstWord = withoutFiller.split( ' ' )[ 0 ] || '';
		const singularised = firstWord.replace( /ies$/, 'y' ).replace( /(?<![su])s$/, '' );
		const adjectiveMap = {
			synced: 'pattern',
			active: 'theme',
			allowed: 'block',
		};
		return adjectiveMap[ singularised ] || singularised;
	};

	// Render tools sorted by entity group with dividers
	const renderToolsWithDividers = ( categoryTools ) => {
		const sorted = [ ...categoryTools ].sort( ( a, b ) => {
			const ea = getEntity( a[ 1 ].title );
			const eb = getEntity( b[ 1 ].title );
			if ( ea !== eb ) {
				return ea.localeCompare( eb );
			}
			return 0;
		} );

		const entityCounts = {};
		sorted.forEach( ( [ , tool ] ) => {
			const entity = getEntity( tool.title );
			if ( entity ) {
				entityCounts[ entity ] = ( entityCounts[ entity ] || 0 ) + 1;
			}
		} );

		const multiToolGroups = Object.values( entityCounts ).filter( ( c ) => c > 1 ).length;
		const showDividers = multiToolGroups >= 2;

		const elements = [];
		let lastEntity = '';
		sorted.forEach( ( [ toolId, tool ], index ) => {
			const entity = getEntity( tool.title );
			if ( showDividers && index > 0 && entity !== lastEntity ) {
				elements.push(
					<hr
						key={ `divider-${ toolId }` }
						style={ {
							margin: '8px 0',
							border: 'none',
							borderTop: '1px solid rgba(0, 0, 0, 0.1)',
							width: '100%',
						} }
					/>
				);
			}
			lastEntity = entity;
			elements.push(
				<ToggleControl
					key={ toolId }
					__nextHasNoMarginBottom
					checked={ tool.enabled }
					label={ tool.title }
					help={ tool.description }
					onChange={ ( checked ) => handleToolChange( toolId, checked ) }
				/>
			);
		} );
		return elements;
	};

	const title = isMergedWrite
		? translate( 'Write' )
		: permissionLevel?.label ?? translate( 'MCP access' );

	// Options C–G link directly here, skipping the tools index page.
	const isFlat = [ 'C', 'D', 'E', 'F', 'G' ].includes( variation );
	const backHref = isFlat ? '/me/mcp' : '/me/mcp-tools';

	const isAccordion = variation === 'E';
	const isToggleHeader = variation === 'F' || variation === 'G';
	let isFirstCategory = true;

	const renderCategoryContent = () => {
		if ( isToggleHeader ) {
			return (
				<VStack spacing={ 8 }>
					{ CATEGORY_ORDER.map( ( categoryName ) => {
						const categoryTools = grouped[ categoryName ];
						if ( ! categoryTools || categoryTools.length === 0 ) {
							return null;
						}

						const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );

						return (
							<Card key={ categoryName }>
								<CardBody>
									<SectionHeader
										level={ 3 }
										title={ categoryName }
										actions={
											<ToggleControl
												__nextHasNoMarginBottom
												checked={ allEnabled }
												label={ <Text weight={ 500 }>{ translate( 'Enable all' ) }</Text> }
												onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
											/>
										}
									/>
								</CardBody>
								<CardDivider />
								<CardBody>
									<VStack spacing={ 3 }>{ renderToolsWithDividers( categoryTools ) }</VStack>
								</CardBody>
							</Card>
						);
					} ) }
				</VStack>
			);
		}

		if ( isAccordion ) {
			return (
				<Card>
					<CardBody style={ { padding: 0 } }>
						<Panel>
							{ CATEGORY_ORDER.map( ( categoryName ) => {
								const categoryTools = grouped[ categoryName ];
								if ( ! categoryTools || categoryTools.length === 0 ) {
									return null;
								}

								const enabledCount = categoryTools.filter( ( [ , tool ] ) => tool.enabled ).length;
								const allEnabled = enabledCount === categoryTools.length;
								const badge = translate( '%(enabled)d/%(total)d', {
									args: { enabled: enabledCount, total: categoryTools.length },
								} );

								const shouldOpen = isFirstCategory;
								isFirstCategory = false;

								const panelTitle = `${ categoryName }  —  ${ badge }`;

								return (
									<PanelBody key={ categoryName } title={ panelTitle } initialOpen={ shouldOpen }>
										<VStack spacing={ 4 }>
											<ToggleControl
												__nextHasNoMarginBottom
												checked={ allEnabled }
												disabled={ mutation.isPending }
												label={
													<Text weight={ 500 }>
														{ allEnabled
															? translate( 'Disable all for %s', {
																	args: [ categoryName ],
															  } )
															: translate( 'Enable all for %s', {
																	args: [ categoryName ],
															  } ) }
													</Text>
												}
												onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
											/>

											<VStack spacing={ 3 }>
												{ categoryTools.map( ( [ toolId, tool ] ) => (
													<ToggleControl
														key={ toolId }
														__nextHasNoMarginBottom
														checked={ tool.enabled }
														label={ tool.title }
														help={ tool.description }
														onChange={ ( checked ) => handleToolChange( toolId, checked ) }
													/>
												) ) }
											</VStack>
										</VStack>
									</PanelBody>
								);
							} ) }
						</Panel>
					</CardBody>
				</Card>
			);
		}

		// Default: Options B, C, D (flat cards per category)
		return (
			<VStack spacing={ 8 }>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );

					return (
						<Card key={ categoryName }>
							<CardBody>
								<VStack spacing={ 8 }>
									<SectionHeader level={ 3 } title={ categoryName } />

									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allEnabled }
										disabled={ mutation.isPending }
										label={
											<Text weight={ 500 }>
												{ translate( 'Enable all for %s', {
													args: [ categoryName ],
												} ) }
											</Text>
										}
										onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
									/>

									<VStack spacing={ 3 }>
										{ categoryTools.map( ( [ toolId, tool ] ) => (
											<ToggleControl
												key={ toolId }
												__nextHasNoMarginBottom
												checked={ tool.enabled }
												label={ tool.title }
												help={ tool.description }
												onChange={ ( checked ) => handleToolChange( toolId, checked ) }
											/>
										) ) }
									</VStack>
								</VStack>
							</CardBody>
						</Card>
					);
				} ) }
			</VStack>
		);
	};

	return (
		<Main wideLayout className="mcp-tools-category">
			<PageViewTracker path={ path } title="MCP Tools Category" />
			<DocumentHead title={ title } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI assistants interact with your WordPress.com account and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
						},
					}
				) }
			/>
			<HeaderCake backText={ translate( 'Back' ) } backHref={ backHref }>
				{ title }
			</HeaderCake>
			{ renderCategoryContent() }
		</Main>
	);
}
