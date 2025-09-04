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

	// Get abilities from the site settings data
	const availableAbilities: [ string, SiteMcpAbilities[ string ] ][] = Object.entries(
		siteSettings?.mcp_abilities || {}
	);
	const hasAbilities = availableAbilities.length > 0;

	const [ formData, setFormData ] = useState< SiteMcpAbilities >(
		siteSettings?.mcp_abilities ?? {}
	);

	// Calculate if any abilities are enabled in form data (for master toggle state)
	const anyAbilitiesEnabled =
		hasAbilities && Object.values( formData ).some( ( ability ) => ability.enabled );

	// Auto-disable master toggle if all abilities are disabled
	useEffect( () => {
		const enabledAbilitiesCount = Object.values( formData ).filter(
			( ability ) => ability.enabled
		).length;

		// If we have abilities but none are enabled, and the master toggle is on,
		// we need to turn off all abilities (which will turn off the master toggle)
		if ( hasAbilities && enabledAbilitiesCount === 0 && anyAbilitiesEnabled ) {
			const disabledAbilities: SiteMcpAbilities = {};
			Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ abilityId, ability ] ) => {
				disabledAbilities[ abilityId ] = {
					...ability,
					enabled: false,
				};
			} );
			setFormData( disabledAbilities );
		}
	}, [ formData, hasAbilities, anyAbilitiesEnabled, siteSettings?.mcp_abilities ] );

	// Gate access to Automatticians only and only if there are abilities to configure
	if ( ! isAutomattician ) {
		return null;
	}

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		// Convert the abilities object to a simple key-value array with enabled status
		const abilitiesArray: Record< string, number > = {};
		Object.entries( formData ).forEach( ( [ abilityId, ability ] ) => {
			abilitiesArray[ abilityId ] = ability.enabled ? 1 : 0;
		} );

		// Create mutation data with the proper type for the API
		// Note: We use double type assertion (as unknown as Partial<SiteSettings>) because
		// the API expects simplified mcp_abilities (Record<string, number>) but the TypeScript
		// type defines full objects (SiteMcpAbilities). The mutation logic handles the transformation.
		const mutationData = { mcp_abilities: abilitiesArray } as unknown as Partial< SiteSettings >;

		mutation.mutate( mutationData, {
			onSuccess: () => {
				createSuccessNotice( __( 'MCP abilities saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save MCP abilities.' ), { type: 'snackbar' } );
			},
		} );
	};

	const handleMasterToggle = ( enabled: boolean ) => {
		setFormData( () => {
			if ( enabled ) {
				// When enabling MCP, auto-enable all available abilities
				const autoEnabledAbilities: SiteMcpAbilities = {};
				Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ abilityId, ability ] ) => {
					autoEnabledAbilities[ abilityId ] = {
						...ability,
						enabled: true, // Auto-enable all abilities
					};
				} );
				return autoEnabledAbilities;
			}
			// When disabling MCP, disable all abilities
			const disabledAbilities: SiteMcpAbilities = {};
			Object.entries( siteSettings?.mcp_abilities || {} ).forEach( ( [ abilityId, ability ] ) => {
				disabledAbilities[ abilityId ] = {
					...ability,
					enabled: false,
				};
			} );
			return disabledAbilities;
		} );
	};

	const handleAbilityChange = ( abilityId: string, enabled: boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ abilityId ]: {
				...prev[ abilityId ],
				enabled,
			},
		} ) );
	};

	// Get abilities from the site settings data, but use form data for current state
	const abilities: [ string, SiteMcpAbilities[ string ] ][] = availableAbilities.map(
		( [ abilityId, ability ] ) => [
			abilityId,
			{
				...ability,
				enabled: formData[ abilityId ]?.enabled ?? ability.enabled,
			},
		]
	);

	// Group abilities by type first, then by category
	const groupedByType: Record<
		string,
		Record< string, [ string, SiteMcpAbilities[ string ] ][] >
	> = abilities.reduce(
		(
			typeGroups: Record< string, Record< string, [ string, SiteMcpAbilities[ string ] ][] > >,
			[ abilityId, ability ]
		) => {
			const type = ability.type || 'tool'; // Default to 'tool' instead of 'other'
			const category = ability.category || 'General';

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
			typeGroups[ type ][ category ].push( [ abilityId, ability ] );
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
		if ( ! hasAbilities ) {
			return (
				<Card>
					<CardBody>
						<Text as="p" variant="muted">
							{ __( 'No MCP abilities are currently available.' ) }
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
									checked={ anyAbilitiesEnabled }
									onChange={ handleMasterToggle }
									label={ __( 'Allow MCP access to this site' ) }
								/>
								{ anyAbilitiesEnabled && (
									<Button variant="secondary" href={ `/sites/${ siteSlug }/settings/mcp-setup` }>
										{ __( 'Configure MCP Client' ) }
									</Button>
								) }
							</div>
						</VStack>
					</CardBody>
				</Card>

				{ hasAbilities && anyAbilitiesEnabled && (
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
											{ Object.entries( typeCategories ).map(
												( [ category, categoryAbilities ] ) => (
													<VStack key={ category } spacing={ 4 }>
														<Text as="h3" style={ { textTransform: 'capitalize' } }>
															{ category }
														</Text>
														{ categoryAbilities.map( ( [ abilityId, ability ] ) => (
															<VStack key={ abilityId } spacing={ 3 }>
																<ToggleControl
																	checked={ ability.enabled }
																	onChange={ ( checked ) =>
																		handleAbilityChange( abilityId, checked )
																	}
																	label={ ability.title }
																	disabled={ ! anyAbilitiesEnabled }
																	help={ ability.description }
																/>
															</VStack>
														) ) }
													</VStack>
												)
											) }
										</VStack>
									</CardBody>
								</Card>
							</div>
						) ) }
					</>
				) }

				{ hasAbilities && (
					<div style={ { marginTop: '24px' } }>
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ mutation.isPending }
						>
							{ mutation.isPending ? __( 'Saving…' ) : __( 'Save MCP settings' ) }
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
