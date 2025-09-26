import {
	isAutomatticianQuery,
	siteBySlugQuery,
	siteSettingsQuery,
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
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo, useCallback } from 'react';
import { ButtonStack } from '../../components/button-stack';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { getSiteMcpAbilities, createSiteSpecificApiPayload } from './utils';
import type { SiteMcpAbilities } from '@automattic/api-core';

function SettingsMcpComponent( { siteSlug }: { siteSlug: string } ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
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
		const abilities = getSiteMcpAbilities( userSettings, site.ID, siteSettings as any );
		return Object.entries( abilities );
	}, [ userSettings, site.ID, siteSettings ] );

	const hasTools = availableTools.length > 0;

	const [ formData, setFormData ] = useState< any >( () => {
		const abilities = getSiteMcpAbilities( userSettings, site.ID, siteSettings as any );
		return {
			...abilities,
		};
	} );

	// Calculate if any tools are enabled in form data (for master toggle state)
	const anyToolsEnabled =
		hasTools &&
		Object.entries( formData ).some(
			( [ key, value ] ) =>
				key !== 'accountToolsEnabled' &&
				typeof value === 'object' &&
				value &&
				( value as any ).enabled
		);

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
		[ formData, userSettings, site.ID, siteSettings, saveMcpMutation, createErrorNotice ]
	);

	const handleMasterToggle = useCallback(
		( enabled: boolean ) => {
			// Get the complete list of available tools from userSettings
			const currentAbilities = getSiteMcpAbilities( userSettings, site.ID, siteSettings as any );
			const updatedTools: any = {};

			// Update all available tools to the same enabled state
			Object.entries( currentAbilities ).forEach( ( [ toolId, tool ] ) => {
				updatedTools[ toolId ] = {
					...( tool as any ),
					enabled,
				};
			} );

			// Preserve the accountToolsEnabled setting
			updatedTools.accountToolsEnabled = formData.accountToolsEnabled;

			setFormData( updatedTools );
		},
		[ userSettings, site.ID, formData.accountToolsEnabled ]
	);

	const handleToolChange = useCallback( ( toolId: string, enabled: boolean ) => {
		setFormData( ( prev: any ) => ( {
			...prev,
			[ toolId ]: {
				...( prev[ toolId ] as any ),
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
				enabled: ( formData[ toolId ] as any )?.enabled ?? ( tool as any ).enabled,
			},
		] );
	}, [ availableTools, formData ] );

	// Gate access to Automatticians only and only if there are tools to configure
	if ( ! isAutomattician ) {
		return null;
	}

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
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
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

							{ hasTools && anyToolsEnabled && (
								<VStack spacing={ 3 }>
									<Heading level={ 4 }>{ __( 'Site-specific MCP Tools' ) }</Heading>
									<Text as="p" variant="muted">
										{ __( 'Control which MCP tools are available for this site.' ) }
									</Text>
									<VStack spacing={ 4 }>
										{ tools
											.filter( ( [ toolId ] ) => toolId !== 'accountToolsEnabled' )
											.map( ( [ toolId, tool ] ) => (
												<ToggleControl
													key={ toolId }
													checked={ tool.enabled }
													onChange={ ( checked ) => handleToolChange( toolId, checked ) }
													label={ tool.title }
													help={ tool.description }
												/>
											) ) }
									</VStack>
								</VStack>
							) }

							{ anyToolsEnabled && (
								<VStack spacing={ 3 }>
									<Heading level={ 4 }>{ __( 'Account-level MCP Tools' ) }</Heading>
									<Text as="p" variant="muted">
										{ createInterpolateElement(
											__(
												'Account-level tools work across all sites. <a>Manage account MCP settings</a>.'
											),
											{
												a: <a href="/me/mcp" target="_blank" rel="noreferrer" />,
											}
										) }
									</Text>
									<ToggleControl
										checked={ formData.accountToolsEnabled ?? true }
										onChange={ ( checked ) =>
											setFormData( ( prev: any ) => ( { ...prev, accountToolsEnabled: checked } ) )
										}
										label={ __( 'Account-level MCP tools' ) }
										help={ __(
											'When enabled, account-level MCP tools will be available on this site.'
										) }
									/>
								</VStack>
							) }

							{ hasTools && (
								<ButtonStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ saveMcpMutation.isPending }
										disabled={ saveMcpMutation.isPending }
									>
										{ saveMcpMutation.isPending ? __( 'Saving…' ) : __( 'Save MCP tools' ) }
									</Button>
								</ButtonStack>
							) }
						</VStack>
					</form>
				</CardBody>
			</Card>
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
