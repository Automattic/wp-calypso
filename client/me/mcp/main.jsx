import { Card } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import { isAutomatticianQuery } from 'calypso/dashboard/app/queries/me-a8c';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { setUserSetting, saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import './style.scss';

function McpComponent( {
	path,
	userSettings,
	isUpdating,
	setUserSetting: setUserSettingProp,
	saveUserSettings: saveUserSettingsProp,
} ) {
	const translate = useTranslate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	// Get abilities from user settings
	const mcpAbilities = userSettings?.mcp_abilities || {};
	const availableAbilities = Object.entries( mcpAbilities );
	const hasAbilities = availableAbilities.length > 0;

	const [ formData, setFormData ] = useState( {
		mcp_abilities: mcpAbilities,
	} );

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

		// Update each ability setting
		Object.entries( formData.mcp_abilities ).forEach( ( [ abilityId, ability ] ) => {
			setUserSettingProp( `mcp_abilities.${ abilityId }`, ability );
		} );

		// Save the settings
		saveUserSettingsProp(
			Object.keys( formData.mcp_abilities ).map( ( abilityId ) => `mcp_abilities.${ abilityId }` )
		)
			.then( () => {
				createSuccessNotice( __( 'MCP abilities saved.' ), { type: 'snackbar' } );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save MCP abilities.' ), { type: 'snackbar' } );
			} );
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

	const renderContent = () => {
		// Get abilities from user settings, but use form data for current state
		const abilities = availableAbilities.map( ( [ abilityId, ability ] ) => [
			abilityId,
			{
				...ability,
				enabled: formData.mcp_abilities?.[ abilityId ]?.enabled ?? ability.enabled,
			},
		] );

		return (
			<>
				<SectionHeader label={ translate( 'MCP Abilities' ) } />
				<Card className="mcp__settings">
					<form onSubmit={ handleSubmit }>
						<FormFieldset>
							<p>
								{ translate(
									'Configure which MCP (Model Context Protocol) abilities are available for your sites. ' +
										'MCP allows AI assistants to access your site data through a secure protocol.'
								) }
							</p>
							<p>
								{ translate(
									'You can enable or disable MCP for individual sites in the site settings, ' +
										'but these global settings control which abilities are available to configure.'
								) }
							</p>
							<hr />
							{ hasAbilities ? (
								<VStack spacing={ 4 }>
									{ abilities.map( ( [ abilityId, ability ] ) => (
										<div key={ abilityId } className="mcp__ability-item">
											<ToggleControl
												checked={ ability.enabled }
												onChange={ ( checked ) => handleAbilityChange( abilityId, checked ) }
												label={ ability.label }
											/>
											<p className="mcp__ability-description">{ ability.description }</p>
										</div>
									) ) }
								</VStack>
							) : (
								<p style={ { color: '#646970', fontSize: '14px', margin: 0 } }>
									{ __( 'No MCP abilities are currently available.' ) }
								</p>
							) }
						</FormFieldset>

						{ hasAbilities && (
							<FormButton isSubmitting={ isUpdating } disabled={ isUpdating }>
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
			<PageViewTracker path={ path } title="MCP Access" />
			<DocumentHead title={ translate( 'MCP Access' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Access' ) } />

			<Card className="mcp__info">
				<p>
					{ translate(
						'You have access to MCP (Model Context Protocol) features. You can configure MCP abilities here and enable them for individual sites in the site settings.'
					) }
				</p>
				<p>
					{ translate(
						'MCP allows AI assistants to access your site data through a secure protocol. You can enable or disable MCP for individual sites and configure which abilities are available.'
					) }
				</p>
			</Card>

			{ renderContent() }
		</Main>
	);
}

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
		isUpdating: isUpdatingUserSettings( state ),
	} ),
	{
		setUserSetting,
		saveUserSettings,
	}
)( McpComponent );
