import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect } from 'react';
import { isAutomatticianQuery } from '../../app/queries/me-a8c';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteSettingsQuery, siteSettingsMutation } from '../../app/queries/site-settings';
import { queryClient } from '../../app/query-client';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { SiteMcpSettings } from '../../data/site-settings';

export default function SettingsMcp( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings, isLoading } = useQuery( siteSettingsQuery( site.ID ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	// Gate access to Automatticians only
	if ( ! isAutomattician ) {
		throw notFound();
	}

	// Parse mcp_settings from JSON string
	const parseMcpSettings = ( mcpSettingsString?: string ): SiteMcpSettings => {
		if ( ! mcpSettingsString ) {
			return {
				mcp_enabled: true,
				mcp_abilities: {},
			};
		}

		try {
			return JSON.parse( mcpSettingsString );
		} catch ( error ) {
			return {
				mcp_enabled: true,
				mcp_abilities: {},
			};
		}
	};

	const parsedMcpSettings = parseMcpSettings( siteSettings?.mcp_settings );

	const [ formData, setFormData ] = useState< SiteMcpSettings >( {
		mcp_enabled: parsedMcpSettings.mcp_enabled,
		mcp_abilities: parsedMcpSettings.mcp_abilities,
	} );

	// Update form data when siteSettings changes
	useEffect( () => {
		if ( siteSettings?.mcp_settings ) {
			const parsed = parseMcpSettings( siteSettings.mcp_settings );
			setFormData( {
				mcp_enabled: parsed.mcp_enabled,
				mcp_abilities: parsed.mcp_abilities,
			} );
		}
	}, [ siteSettings?.mcp_settings ] );

	const renderContent = () => {
		// Show loading state while data is being fetched
		if ( isLoading ) {
			return (
				<Card>
					<CardBody>
						<p>{ __( 'Loading MCP settings…' ) }</p>
					</CardBody>
				</Card>
			);
		}

		const handleSubmit = ( e: React.FormEvent ) => {
			e.preventDefault();

			// Build the complete mcp_abilities object with all required properties
			const mcp_abilities: Record<
				string,
				{ label: string; description: string; enabled: boolean }
			> = {};

			// Get the base abilities from site settings
			const baseAbilities = parsedMcpSettings.mcp_abilities || {};

			// Merge with form data to get current enabled state
			Object.entries( baseAbilities ).forEach( ( [ abilityId, ability ] ) => {
				mcp_abilities[ abilityId ] = {
					label: ability.label,
					description: ability.description,
					enabled: formData.mcp_abilities?.[ abilityId ]?.enabled ?? ability.enabled,
				};
			} );

			// Create the complete MCP settings object
			const mcpSettingsObject = {
				mcp_enabled: formData.mcp_enabled,
				mcp_abilities,
			};

			// Convert to JSON string
			const mcpSettingsJson = JSON.stringify( mcpSettingsObject );

			const mutationData = {
				mcp_settings: mcpSettingsJson,
			};

			mutation.mutate( mutationData, {
				onSuccess: () => {
					// Manually update the cache with our sent data to ensure it's preserved
					queryClient.setQueryData(
						siteSettingsQuery( site.ID ).queryKey,
						( oldData ) =>
							oldData && {
								...oldData,
								...mutationData, // Use our sent data instead of response data
							}
					);
					createSuccessNotice( __( 'MCP settings saved.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save MCP settings.' ), { type: 'snackbar' } );
				},
			} );
		};

		const handleMcpEnabledChange = ( enabled: boolean ) => {
			setFormData( ( prev ) => ( {
				...prev,
				mcp_enabled: enabled,
				// If disabling MCP, disable all abilities
				mcp_abilities: enabled ? prev.mcp_abilities : {},
			} ) );
		};

		const handleAbilityChange = ( abilityId: string, enabled: boolean ) => {
			setFormData( ( prev ) => ( {
				...prev,
				mcp_abilities: {
					...prev.mcp_abilities,
					[ abilityId ]: {
						...prev.mcp_abilities[ abilityId ],
						enabled,
					},
				},
			} ) );
		};

		// Get abilities from the site settings data, but use form data for current state
		const availableAbilities = Object.entries( parsedMcpSettings.mcp_abilities || {} );
		const abilities = availableAbilities.map( ( [ abilityId, ability ] ) => [
			abilityId,
			{
				...ability,
				enabled: formData.mcp_abilities?.[ abilityId ]?.enabled ?? ability.enabled,
			},
		] );

		return (
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 6 }>
					{ /* Main MCP toggle in its own card */ }
					<Card>
						<CardBody>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Enable Model Context Protocol (MCP)' ) }
								help={ __(
									'Allow AI assistants to access your site data through the Model Context Protocol.'
								) }
								checked={ formData.mcp_enabled }
								onChange={ handleMcpEnabledChange }
							/>
						</CardBody>
					</Card>

					{ /* Abilities settings in a separate card */ }
					{ formData.mcp_enabled && (
						<Card>
							<CardBody>
								<VStack spacing={ 4 }>
									<h3 style={ { margin: 0, fontSize: '16px', fontWeight: 600 } }>
										{ __( 'MCP Abilities' ) }
									</h3>

									{ abilities.length > 0 ? (
										<VStack spacing={ 3 }>
											{ abilities.map( ( [ abilityId, ability ] ) => (
												<CheckboxControl
													key={ abilityId }
													__nextHasNoMarginBottom
													label={ ability.label }
													help={ ability.description }
													checked={ ability.enabled }
													onChange={ ( checked ) => handleAbilityChange( abilityId, checked ) }
												/>
											) ) }
										</VStack>
									) : (
										<p style={ { color: '#646970', fontSize: '14px', margin: 0 } }>
											{ __( 'No MCP abilities are currently available for this site.' ) }
										</p>
									) }
								</VStack>
							</CardBody>
						</Card>
					) }

					{ /* Save button */ }
					<HStack justify="flex-start">
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ mutation.isPending }
						>
							{ __( 'Save' ) }
						</Button>
					</HStack>
				</VStack>
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
