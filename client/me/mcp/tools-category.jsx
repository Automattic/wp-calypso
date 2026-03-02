/**
 * MCP Tools Category — Category detail page with tool toggles
 * Legacy port of: client/dashboard/me/mcp/tools/category.tsx
 */
import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
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

import './style.scss';

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

	// Track which tool IDs have a pending mutation so we can disable only
	// the affected toggles instead of the entire page.
	const [ pendingToolIds, setPendingToolIds ] = useState( () => new Set() );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const allTools = Object.entries( mcpAbilities );

	// Merge Write + Manage into a single "Write" page.
	const isMergedWrite = categorySlug === 'write';

	// Filter to tools matching this permission level
	const tools = allTools.filter( ( [ , tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( isMergedWrite ) {
			return level === 'write' || level === 'manage';
		}
		return level === categorySlug;
	} );

	const handleToolChange = ( toolId, enabled ) => {
		setPendingToolIds( ( prev ) => new Set( prev ).add( toolId ) );
		mutation.mutate(
			{ mcp_abilities: { account: { [ toolId ]: enabled } } },
			{
				onSettled: () => {
					setPendingToolIds( ( prev ) => {
						const next = new Set( prev );
						next.delete( toolId );
						return next;
					} );
				},
			}
		);
	};

	const handleSectionToggleAll = ( sectionTools, enabled ) => {
		const toolIds = sectionTools.map( ( [ toolId ] ) => toolId );
		setPendingToolIds( ( prev ) => {
			const next = new Set( prev );
			toolIds.forEach( ( id ) => next.add( id ) );
			return next;
		} );
		const account = {};
		sectionTools.forEach( ( [ toolId ] ) => {
			account[ toolId ] = enabled;
		} );
		mutation.mutate(
			{ mcp_abilities: { account } },
			{
				onSettled: () => {
					setPendingToolIds( ( prev ) => {
						const next = new Set( prev );
						toolIds.forEach( ( id ) => next.delete( id ) );
						return next;
					} );
				},
			}
		);
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

	// Render tools sorted by entity group with dividers between groups.
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
					<div
						key={ `divider-${ toolId }` }
						style={ {
							margin: 0,
							height: '1px',
							backgroundColor: 'var(--color-border-subtle)',
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
					disabled={ pendingToolIds.has( toolId ) }
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

	const backHref = '/me/mcp';

	const renderCategoryContent = () => {
		return (
			<VStack spacing={ 8 }>
				<style>
					{ '.dashboard-section-header .dashboard-section-header__heading-row { min-height: 0; }' }
				</style>
				{ CATEGORY_ORDER.map( ( categoryName ) => {
					const categoryTools = grouped[ categoryName ];
					if ( ! categoryTools || categoryTools.length === 0 ) {
						return null;
					}

					const allEnabled = categoryTools.every( ( [ , tool ] ) => tool.enabled );
					const sectionPending = categoryTools.some( ( [ toolId ] ) =>
						pendingToolIds.has( toolId )
					);

					return (
						<Card key={ categoryName } isRounded={ false } style={ { borderRadius: 0 } }>
							<CardBody>
								<SectionHeader
									level={ 3 }
									title={ categoryName }
									actions={
										<ToggleControl
											__nextHasNoMarginBottom
											checked={ allEnabled }
											disabled={ sectionPending }
											label={ <Text weight={ 400 }>{ translate( 'Enable all' ) }</Text> }
											onChange={ ( checked ) => handleSectionToggleAll( categoryTools, checked ) }
										/>
									}
								/>
							</CardBody>
							<div
								style={ {
									height: '1px',
									backgroundColor: 'var(--color-border-subtle)',
									margin: 0,
								} }
							/>
							<CardBody>
								<VStack spacing={ 4 }>{ renderToolsWithDividers( categoryTools ) }</VStack>
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
					'Control how AI agents interact with your WordPress.com account and sites.'
				) }
			/>
			<HeaderCake backText={ translate( 'Back' ) } backHref={ backHref }>
				{ title }
			</HeaderCake>
			{ renderCategoryContent() }
		</Main>
	);
}
