import { isAutomatticianQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
	CardHeader,
	ToggleControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect, useDispatch as useReduxDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormButton from 'calypso/components/forms/form-button';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';

function McpComponent( { path, userSettings, isUpdating } ) {
	const translate = useTranslate();
	const reduxDispatch = useReduxDispatch();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	// Get abilities from user settings
	const mcpAbilities = userSettings?.mcp_abilities || {};
	const availableAbilities = Object.entries( mcpAbilities );
	const hasAbilities = availableAbilities.length > 0;

	const [ formData, setFormData ] = useState( {
		mcp_abilities: mcpAbilities,
	} );

	// Calculate if any abilities are enabled (for master toggle and individual toggle disabled state)
	const anyAbilitiesEnabled =
		hasAbilities && Object.values( formData.mcp_abilities ).some( ( ability ) => ability.enabled );

	// Check if form data has changed from original user settings
	const hasUnsavedChanges = ( () => {
		if ( ! userSettings?.mcp_abilities || ! formData.mcp_abilities ) {
			return false;
		}

		return Object.keys( userSettings.mcp_abilities ).some( ( abilityId ) => {
			const originalEnabled = userSettings.mcp_abilities[ abilityId ]?.enabled;
			const currentEnabled = formData.mcp_abilities[ abilityId ]?.enabled;
			return originalEnabled !== currentEnabled;
		} );
	} )();

	// Update form data when userSettings changes
	useEffect( () => {
		if ( userSettings?.mcp_abilities ) {
			setFormData( {
				mcp_abilities: userSettings.mcp_abilities,
			} );
		}
	}, [ userSettings?.mcp_abilities ] );

	if ( ! isAutomattician ) {
		return null;
	}

	const handleSubmit = ( e ) => {
		e.preventDefault();

		// Use settingsOverride to bypass the unsaved settings mechanism
		// Convert the abilities object to a simple key-value array with enabled status
		const abilitiesArray = {};
		Object.entries( formData.mcp_abilities ).forEach( ( [ abilityId, ability ] ) => {
			abilitiesArray[ abilityId ] = ability.enabled ? 1 : 0;
		} );

		const settingsData = { mcp_abilities: abilitiesArray };

		// Save directly using settingsOverride
		reduxDispatch( saveUserSettings( settingsData ) );
	};

	const handleAbilityChange = ( abilityId, enabled ) => {
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

	const handleMasterToggle = ( enabled ) => {
		setFormData( ( prev ) => ( {
			...prev,
			mcp_abilities: Object.keys( prev.mcp_abilities ).reduce( ( acc, abilityId ) => {
				acc[ abilityId ] = {
					...prev.mcp_abilities[ abilityId ],
					enabled,
				};
				return acc;
			}, {} ),
		} ) );
	};

	const renderContent = () => {
		// Get abilities from user settings, but use form data for current state
		const abilities = availableAbilities.map( ( [ abilityId, ability ] ) => [
			abilityId,
			{
				...ability,
				enabled: formData.mcp_abilities?.[ abilityId ]?.enabled ?? ability.enabled,
			},
		] );

		// Group abilities by type first, then by category
		const groupedByType = abilities.reduce( ( typeGroups, [ abilityId, ability ] ) => {
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
		}, {} );

		// Type descriptions
		const typeDescriptions = {
			tool: translate(
				'Tools allow AI assistants to perform actions on your behalf, such as creating posts or managing site settings.'
			),
			resource: translate(
				'Resources provide AI assistants with read-only access to your data, such as site statistics or user information.'
			),
			prompt: translate(
				'Prompts help AI assistants understand context and provide better responses to your queries.'
			),
		};

		// Type display names
		const typeDisplayNames = {
			tool: translate( 'Tools' ),
			resource: translate( 'Resources' ),
			prompt: translate( 'Prompts' ),
		};

		return (
			<form onSubmit={ handleSubmit }>
				<SectionHeader label={ translate( 'MCP Access Control' ) } />
				<Card style={ { borderRadius: '0' } }>
					<CardBody>
						{ hasAbilities ? (
							<VStack spacing={ 2 }>
								<div
									style={ {
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									} }
								>
									<ToggleControl
										checked={ anyAbilitiesEnabled }
										onChange={ handleMasterToggle }
										label={ translate( 'Allow MCP access' ) }
									/>
									{ anyAbilitiesEnabled && (
										<Button variant="secondary" href="/me/mcp-setup">
											{ translate( 'Configure MCP Client' ) }
										</Button>
									) }
								</div>
							</VStack>
						) : (
							<Text as="p" variant="muted">
								{ translate( 'No MCP abilities are currently available.' ) }
							</Text>
						) }
					</CardBody>
				</Card>

				{ hasAbilities && anyAbilitiesEnabled && (
					<>
						{ Object.entries( groupedByType ).map( ( [ type, typeCategories ] ) => (
							<div key={ type } style={ { marginTop: '24px' } }>
								<Card style={ { borderRadius: '0' } }>
									<CardHeader size="small">
										<VStack spacing={ 2 }>
											<Text as="h1">{ typeDisplayNames[ type ] }</Text>
											<Text as="p" variant="muted">
												{ typeDescriptions[ type ] }
											</Text>
										</VStack>
									</CardHeader>
									<CardBody>
										<VStack spacing={ 6 }>
											{ Object.entries( typeCategories ).map(
												( [ category, categoryAbilities ] ) => (
													<VStack key={ category } spacing={ 4 }>
														<Text as="h3" style={ { textTransform: 'capitalize' } }>
															{ category }
														</Text>
														<VStack spacing={ 4 }>
															{ categoryAbilities.map( ( [ abilityId, ability ] ) => (
																<VStack key={ abilityId } spacing={ 3 }>
																	<ToggleControl
																		checked={ ability.enabled }
																		onChange={ ( checked ) =>
																			handleAbilityChange( abilityId, checked )
																		}
																		label={ ability.title }
																		help={ ability.description }
																		disabled={ ! anyAbilitiesEnabled }
																	/>
																</VStack>
															) ) }
														</VStack>
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
						<FormButton isSubmitting={ isUpdating } disabled={ isUpdating || ! hasUnsavedChanges }>
							{ isUpdating ? translate( 'Saving…' ) : translate( 'Save MCP abilities' ) }
						</FormButton>
					</div>
				) }
			</form>
		);
	};

	return (
		<Main wideLayout className="mcp">
			<PageViewTracker path={ path } title="MCP Account Settings" />
			<DocumentHead title={ translate( 'Model Context Protocol (MCP) Account Settings' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'MCP Account Settings' ) }
				subtitle={ translate(
					'MCP (Model Context Protocol) enables AI assistants to securely access and interact with your WordPress.com data. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
						},
					}
				) }
			/>
			{ renderContent() }
		</Main>
	);
}

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
		isUpdating: isUpdatingUserSettings( state ),
	} ),
	{}
)( McpComponent );
