import {
	isAutomatticianQuery,
	siteBySlugQuery,
	siteSettingsQuery,
	siteSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
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
import { useState, useEffect } from 'react';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { SiteMcpAbilities, SiteSettings } from '@automattic/api-core';

export default function SettingsMcp( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	// Get tools from the site settings data
	const availableTools: [ string, SiteMcpAbilities[ string ] ][] = Object.entries(
		siteSettings?.mcp_abilities || {}
	);
	const hasTools = availableTools.length > 0;

	const [ formData, setFormData ] = useState< SiteMcpAbilities >(
		siteSettings?.mcp_abilities ?? {}
	);

	// Calculate if any tools are enabled in form data (for master toggle state)
	const anyToolsEnabled = hasTools && Object.values( formData ).some( ( tool ) => tool.enabled );

	// Auto-disable master toggle if all tools are disabled
	useEffect( () => {
		const enabledToolsCount = Object.values( formData ).filter( ( tool ) => tool.enabled ).length;

		// If we have tools but none are enabled, and the master toggle is on,
		// we need to turn off all tools (which will turn off the master toggle)
		if ( hasTools && enabledToolsCount === 0 && anyToolsEnabled ) {
			const disabledTools: SiteMcpAbilities = {};
			Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ toolId, tool ] ) => {
				disabledTools[ toolId ] = {
					...tool,
					enabled: false,
				};
			} );
			setFormData( disabledTools );
		}
	}, [ formData, hasTools, anyToolsEnabled, siteSettings?.mcp_abilities ] );

	// Gate access to Automatticians only and only if there are tools to configure
	if ( ! isAutomattician ) {
		return null;
	}

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		// Convert the tools object to a simple key-value array with enabled status
		const toolsArray: Record< string, number > = {};
		Object.entries( formData ).forEach( ( [ toolId, tool ] ) => {
			toolsArray[ toolId ] = tool.enabled ? 1 : 0;
		} );

		// Create mutation data with the proper type for the API
		// Note: We use double type assertion (as unknown as Partial<SiteSettings>) because
		// the API expects simplified mcp_abilities (Record<string, number>) but the TypeScript
		// type defines full objects (SiteMcpAbilities). The mutation logic handles the transformation.
		const mutationData = { mcp_abilities: toolsArray } as unknown as Partial< SiteSettings >;

		mutation.mutate( mutationData, {
			onSuccess: () => {
				createSuccessNotice( __( 'MCP tools saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save MCP tools.' ), { type: 'snackbar' } );
			},
		} );
	};

	const handleMasterToggle = ( enabled: boolean ) => {
		setFormData( () => {
			if ( enabled ) {
				// When enabling MCP, auto-enable all available tools
				const autoEnabledTools: SiteMcpAbilities = {};
				Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ toolId, tool ] ) => {
					autoEnabledTools[ toolId ] = {
						...tool,
						enabled: true, // Auto-enable all tools
					};
				} );
				return autoEnabledTools;
			}
			// When disabling MCP, disable all tools
			const disabledTools: SiteMcpAbilities = {};
			Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ toolId, tool ] ) => {
				disabledTools[ toolId ] = {
					...tool,
					enabled: false,
				};
			} );
			return disabledTools;
		} );
	};

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ toolId ]: {
				...prev[ toolId ],
				enabled,
			},
		} ) );
	};

	// Get tools from the site settings data, but use form data for current state
	const tools: [ string, SiteMcpAbilities[ string ] ][] = availableTools.map(
		( [ toolId, tool ] ) => [
			toolId,
			{
				...tool,
				enabled: formData[ toolId ]?.enabled ?? tool.enabled,
			},
		]
	);

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
			'Tools allow AI assistants to perform actions on your behalf, such as creating posts or managing site settings.'
		),
		resource: __(
			'Resources provide AI assistants with read-only access to your data, such as site statistics or user information.'
		),
		prompt: __(
			'Prompts help AI assistants understand context and provide better responses to your queries.'
		),
	};

	// Type display names
	const typeDisplayNames: Record< string, string > = {
		tool: __( 'Tools' ),
		resource: __( 'Resources' ),
		prompt: __( 'Prompts' ),
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
						{ Object.entries( groupedByType ).map( ( [ type, typeCategories ] ) => (
							<div key={ type } style={ { marginTop: '24px' } }>
								<Text as="h1">{ typeDisplayNames[ type ] }</Text>
								<Text as="p" variant="muted" style={ { marginBottom: '16px' } }>
									{ typeDescriptions[ type ] }
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
																disabled={ ! anyToolsEnabled }
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
						) ) }
					</>
				) }

				{ hasTools && (
					<div style={ { marginTop: '24px' } }>
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ mutation.isPending }
						>
							{ mutation.isPending ? __( 'Saving…' ) : __( 'Save MCP tools' ) }
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
