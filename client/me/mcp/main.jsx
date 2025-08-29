import { Card } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect, useDispatch as useReduxDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { isAutomatticianQuery } from 'calypso/dashboard/app/queries/me-a8c';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import './style.scss';

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

		// Group abilities by category
		const groupedAbilities = abilities.reduce( ( groups, [ abilityId, ability ] ) => {
			const category = ability.category || 'Other';
			if ( ! groups[ category ] ) {
				groups[ category ] = [];
			}
			groups[ category ].push( [ abilityId, ability ] );
			return groups;
		}, {} );

		// Format ability name for display
		const formatAbilityName = ( abilityId ) => {
			// Remove 'wpcom-mcp/' prefix and convert to title case
			const name = abilityId.replace( 'wpcom-mcp/', '' );
			return name
				.split( '-' )
				.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
				.join( ' ' );
		};

		return (
			<>
				<Card className="mcp__settings">
					<form onSubmit={ handleSubmit }>
						<FormFieldset>
							<p>
								{ translate(
									'MCP (Model Context Protocol) enables AI assistants to securely access and interact with your WordPress.com data. ' +
										'These settings control which specific capabilities are available to AI tools that use MCP.'
								) }
							</p>
							{ hasAbilities ? (
								<>
									<div className="mcp__master-toggle">
										<ToggleControl
											checked={ anyAbilitiesEnabled }
											onChange={ handleMasterToggle }
											label={ translate( 'Allow MCP access' ) }
										/>
									</div>
									<hr />
									<VStack spacing={ 6 }>
										<h1 className="mcp__category-header">{ translate( 'MCP Abilities' ) }</h1>
										{ Object.entries( groupedAbilities ).map(
											( [ category, categoryAbilities ] ) => (
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
											)
										) }
									</VStack>
								</>
							) : (
								<p style={ { color: '#646970', fontSize: '14px', margin: 0 } }>
									{ translate( 'No MCP abilities are currently available.' ) }
								</p>
							) }
						</FormFieldset>

						{ hasAbilities && (
							<FormButton
								isSubmitting={ isUpdating }
								disabled={ isUpdating || ! hasUnsavedChanges }
							>
								{ isUpdating ? translate( 'Saving…' ) : translate( 'Save MCP abilities' ) }
							</FormButton>
						) }
					</form>
				</Card>
			</>
		);
	};

	return (
		<Main wideLayout className="mcp">
			<PageViewTracker path={ path } title="MCP Client Access" />
			<DocumentHead title={ translate( 'MCP Client Access' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Client Access' ) } />
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
