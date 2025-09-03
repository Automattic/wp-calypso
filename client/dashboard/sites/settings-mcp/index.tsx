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
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect } from 'react';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { SiteMcpAbilities, SiteSettings } from '@automattic/api-core';
import './style.scss';

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

	// Format ability name for display
	const formatAbilityName = ( abilityId: string ) => {
		// Remove 'wpcom-mcp/' prefix and convert to title case
		const name = abilityId.replace( 'wpcom-mcp/', '' );
		return name
			.split( '-' )
			.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
			.join( ' ' );
	};

	const renderContent = () => {
		if ( ! hasAbilities ) {
			return (
				<Card>
					<CardBody>
						<p style={ { color: '#646970', fontSize: '14px', margin: 0 } }>
							{ __( 'No MCP abilities are currently available.' ) }
						</p>
					</CardBody>
				</Card>
			);
		}

		return (
			<form onSubmit={ handleSubmit }>
				<div className="mcp__settings">
					<>
						<div className="mcp__master-toggle">
							<ToggleControl
								checked={ anyAbilitiesEnabled }
								onChange={ handleMasterToggle }
								label={ __( 'Allow MCP access to this site' ) }
							/>
						</div>

						{ anyAbilitiesEnabled && (
							<div className="mcp__setup-section">
								<h3 className="mcp__setup-section-title">{ __( 'MCP Client Setup' ) }</h3>
								<p className="mcp__setup-section-description">
									{ __(
										'Now that MCP is enabled, you can configure your MCP client to connect to this site.'
									) }
								</p>
								<Button
									variant="secondary"
									href={ `/sites/${ siteSlug }/settings/mcp-setup` }
									className="mcp__setup-button"
								>
									{ __( 'Configure MCP Client →' ) }
								</Button>
							</div>
						) }

						<VStack spacing={ 8 }>
							{ Object.entries( groupedByType ).map( ( [ type, typeCategories ] ) => (
								<div key={ type } className="mcp__type-section">
									<h2 className="mcp__type-title">{ typeDisplayNames[ type ] }</h2>
									<p className="mcp__type-description">{ typeDescriptions[ type ] }</p>
									<VStack spacing={ 6 }>
										{ Object.entries( typeCategories ).map( ( [ category, categoryAbilities ] ) => (
											<div key={ category } className="mcp__category">
												<h3 className="mcp__category-title">{ category }</h3>
												<VStack spacing={ 4 }>
													{ categoryAbilities.map( ( [ abilityId, ability ] ) => (
														<div key={ abilityId } className="mcp__ability-item">
															<ToggleControl
																checked={ ability.enabled }
																onChange={ ( checked ) =>
																	handleAbilityChange( abilityId, checked )
																}
																label={ formatAbilityName( abilityId ) }
																disabled={ ! anyAbilitiesEnabled }
															/>
															<p className="mcp__ability-description">{ ability.description }</p>
														</div>
													) ) }
												</VStack>
											</div>
										) ) }
									</VStack>
								</div>
							) ) }
						</VStack>
					</>
					<Button
						variant="primary"
						type="submit"
						isBusy={ mutation.isPending }
						disabled={ mutation.isPending }
					>
						{ mutation.isPending ? __( 'Saving…' ) : __( 'Save MCP settings' ) }
					</Button>
				</div>
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
