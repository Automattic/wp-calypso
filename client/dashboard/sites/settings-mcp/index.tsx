import {
	isAutomatticianQuery,
	siteBySlugQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ToggleControl,
	ExternalLink,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo, useCallback, createElement } from 'react';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { getSiteMcpAbilities, createSiteSpecificApiPayload } from './utils';
import type { SiteMcpAbilities } from '@automattic/api-core';

function SettingsMcpComponent( { siteSlug }: { siteSlug: string } ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	// Use the standard userSettingsMutation (now supports mcp_abilities)
	const saveMcpMutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP tools saved.' ),
				error: __( 'Failed to save MCP tools.' ),
			},
		},
	} );

	// Get tools from user settings using the new nested structure
	const availableTools = useMemo( (): [ string, SiteMcpAbilities[ string ] ][] => {
		const abilities = getSiteMcpAbilities( userSettings, site.ID );
		return Object.entries( abilities );
	}, [ userSettings, site.ID ] );

	const hasTools = availableTools.length > 0;

	const [ formData, setFormData ] = useState< SiteMcpAbilities >( () =>
		getSiteMcpAbilities( userSettings, site.ID )
	);

	// Calculate if any tools are enabled in form data (for master toggle state)
	const anyToolsEnabled = hasTools && Object.values( formData ).some( ( tool ) => tool.enabled );

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();

			try {
				// Create optimized API payload using the new structure
				const apiData = createSiteSpecificApiPayload( userSettings, site.ID, formData );

				// Save using custom mutation (bypasses saveableKeys filtering)
				saveMcpMutation.mutate( apiData as any );
			} catch ( error ) {
				createErrorNotice( __( 'Failed to save MCP tools.' ), { type: 'snackbar' } );
			}
		},
		[ formData, userSettings, site.ID, saveMcpMutation, createErrorNotice ]
	);

	const handleMasterToggle = useCallback(
		( enabled: boolean ) => {
			// Get the complete list of available tools from userSettings
			const currentAbilities = getSiteMcpAbilities( userSettings, site.ID );
			const updatedTools: SiteMcpAbilities = {};

			// Update all available tools to the same enabled state
			Object.entries( currentAbilities ).forEach( ( [ toolId, tool ] ) => {
				updatedTools[ toolId ] = {
					...tool,
					enabled,
				};
			} );

			setFormData( updatedTools );
		},
		[ userSettings, site.ID ]
	);

	const handleToolChange = useCallback( ( toolId: string, enabled: boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ toolId ]: {
				...prev[ toolId ],
				enabled,
			},
		} ) );
	}, [] );

	// Get tools from user settings, but use form data for current state
	const tools = useMemo( (): [ string, SiteMcpAbilities[ string ] ][] => {
		return availableTools.map( ( [ toolId, tool ] ) => [
			toolId,
			{
				...tool,
				enabled: formData[ toolId ]?.enabled ?? tool.enabled,
			},
		] );
	}, [ availableTools, formData ] );

	// Gate access to Automatticians only and only if there are tools to configure
	if ( ! isAutomattician ) {
		return null;
	}

	// Group tools by type first, then by category
	const groupedByType: Record<
		string,
		Record< string, [ string, SiteMcpAbilities[ string ] ][] >
	> = tools.reduce(
		(
			typeGroups: Record< string, Record< string, [ string, SiteMcpAbilities[ string ] ][] > >,
			[ toolId, tool ]
		) => {
			const type = tool.type || 'tool'; // Default to 'tool' instead of 'other'
			const category = tool.category || 'General';

			// Only include the three main types
			if ( ! [ 'tool', 'resource', 'prompt' ].includes( type ) ) {
				return typeGroups;
			}

			if ( ! typeGroups[ type ] ) {
				typeGroups[ type ] = {};
			}
			if ( ! typeGroups[ type ][ category ] ) {
				typeGroups[ type ][ category ] = [];
			}
			typeGroups[ type ][ category ].push( [ toolId, tool ] );
			return typeGroups;
		},
		{} as Record< string, Record< string, [ string, SiteMcpAbilities[ string ] ][] > >
	);

	// Type descriptions
	const typeDescriptions: Record< string, string > = {
		tool: __(
			'Tools allow AI assistants to read and search your WordPress.com data. These are view-only capabilities that cannot modify your content or settings.'
		),
		resource: __(
			'Resources provide AI assistants with read-only access to your data, such as site statistics or user information.'
		),
		prompt: __(
			'Prompts help AI assistants understand context and provide better responses to your queries.'
		),
	};

	const renderContent = () => {
		if ( ! hasTools ) {
			return (
				<Card>
					<CardBody>
						<Text as="p" variant="muted">
							{ __( 'No MCP tools are currently available.' ) }
						</Text>
					</CardBody>
				</Card>
			);
		}

		return (
			<form onSubmit={ handleSubmit }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<div
								style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }
							>
								<ToggleControl
									checked={ anyToolsEnabled }
									onChange={ handleMasterToggle }
									label={ __( 'Allow MCP access to this site' ) }
								/>
								{ anyToolsEnabled && (
									<Button variant="secondary" href={ `/sites/${ siteSlug }/settings/mcp-setup` }>
										{ __( 'Configure MCP Client' ) }
									</Button>
								) }
							</div>
						</VStack>
					</CardBody>
				</Card>

				{ hasTools && anyToolsEnabled && (
					<>
						{ Object.entries( groupedByType ).map( ( [ type, typeCategories ] ) => {
							const typeKey = type as 'tool' | 'resource' | 'prompt';
							return (
								<div key={ type } style={ { marginTop: '24px' } }>
									<Text as="h1">{ __( 'Site-level MCP Tools' ) }</Text>
									<Text as="p" variant="muted" style={ { marginBottom: '16px' } }>
										{ typeDescriptions[ typeKey ] }
									</Text>
									<Card>
										<CardBody>
											<VStack spacing={ 6 }>
												{ Object.entries( typeCategories ).map( ( [ category, categoryTools ] ) => (
													<VStack key={ category } spacing={ 4 }>
														<Text as="h3" style={ { textTransform: 'capitalize' } }>
															{ category }
														</Text>
														{ categoryTools.map( ( [ toolId, tool ] ) => (
															<VStack key={ toolId } spacing={ 3 }>
																<ToggleControl
																	checked={ tool.enabled }
																	onChange={ ( checked ) => handleToolChange( toolId, checked ) }
																	label={ tool.title }
																	help={ tool.description }
																/>
															</VStack>
														) ) }
													</VStack>
												) ) }
											</VStack>
										</CardBody>
									</Card>
								</div>
							);
						} ) }
					</>
				) }

				{ anyToolsEnabled && (
					<>
						<div style={ { marginTop: '24px' } }>
							<Text as="h1">{ __( 'Account-level MCP Tools' ) }</Text>
							<Text as="p" variant="muted" style={ { margin: 0 } }>
								{ createInterpolateElement(
									__(
										'Account-level MCP tools are available across all your sites, <a>manage account MCP settings</a>.'
									),
									{
										a: createElement( 'a', { href: '/me/mcp', target: '_blank' } ),
									}
								) }
							</Text>
						</div>
					</>
				) }

				{ hasTools && (
					<div style={ { marginTop: '24px' } }>
						<Button
							variant="primary"
							type="submit"
							isBusy={ saveMcpMutation.isPending }
							disabled={ saveMcpMutation.isPending }
						>
							{ saveMcpMutation.isPending ? __( 'Saving…' ) : __( 'Save MCP tools' ) }
						</Button>
					</div>
				) }
			</form>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Model Context Protocol (MCP) Settings' ) }
					description={ createInterpolateElement(
						__(
							'Control how AI assistants can access your site data through the <mcpLink>Model Context Protocol</mcpLink>.'
						),
						{
							mcpLink: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
								<ExternalLink href="https://modelcontextprotocol.io/" />
							),
						}
					) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}

export default SettingsMcpComponent;
