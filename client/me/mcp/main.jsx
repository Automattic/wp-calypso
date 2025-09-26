import { isAutomatticianQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Card,
	CardBody,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect, useDispatch as useReduxDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormButton from 'calypso/components/forms/form-button';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import { ButtonStack } from '../../dashboard/components/button-stack';
import { getAccountMcpAbilities, createAccountApiPayload } from './utils';

function McpComponent( { path, userSettings, isUpdating } ) {
	const translate = useTranslate();
	const reduxDispatch = useReduxDispatch();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	// Get account-level tools from user settings using the new nested structure
	const mcpAbilities = getAccountMcpAbilities( userSettings );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;

	const [ formData, setFormData ] = useState( {
		mcp_abilities: mcpAbilities,
	} );

	// Calculate if any tools are enabled (for master toggle and individual toggle disabled state)
	const anyToolsEnabled =
		hasTools && Object.values( formData.mcp_abilities ).some( ( tool ) => tool.enabled );

	// Check if form data has changed from original user settings
	const hasUnsavedChanges = ( () => {
		const originalAbilities = getAccountMcpAbilities( userSettings );
		if ( ! originalAbilities || ! formData.mcp_abilities ) {
			return false;
		}

		return Object.keys( originalAbilities ).some( ( toolId ) => {
			const originalEnabled = originalAbilities[ toolId ]?.enabled;
			const currentEnabled = formData.mcp_abilities[ toolId ]?.enabled;
			return originalEnabled !== currentEnabled;
		} );
	} )();

	// Update form data when userSettings changes
	useEffect( () => {
		const accountAbilities = getAccountMcpAbilities( userSettings );
		setFormData( {
			mcp_abilities: accountAbilities,
		} );
	}, [ userSettings ] );

	if ( ! isAutomattician ) {
		return null;
	}

	const handleSubmit = ( e ) => {
		e.preventDefault();

		// Create the new nested API payload for account-level settings
		const settingsData = createAccountApiPayload( userSettings, formData.mcp_abilities );

		// Save using the new nested structure
		reduxDispatch( saveUserSettings( settingsData ) );
	};

	const handleToolChange = ( toolId, enabled ) => {
		setFormData( ( prev ) => ( {
			...prev,
			mcp_abilities: {
				...prev.mcp_abilities,
				[ toolId ]: {
					...prev.mcp_abilities[ toolId ],
					enabled,
				},
			},
		} ) );
	};

	const handleMasterToggle = ( enabled ) => {
		setFormData( ( prev ) => ( {
			...prev,
			mcp_abilities: Object.keys( prev.mcp_abilities ).reduce( ( acc, toolId ) => {
				acc[ toolId ] = {
					...prev.mcp_abilities[ toolId ],
					enabled,
				};
				return acc;
			}, {} ),
		} ) );
	};

	const renderContent = () => {
		// Get tools from user settings, but use form data for current state
		const tools = availableTools.map( ( [ toolId, tool ] ) => [
			toolId,
			{
				...tool,
				enabled: formData.mcp_abilities?.[ toolId ]?.enabled ?? tool.enabled,
			},
		] );

		return (
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							{ hasTools ? (
								<div
									style={ {
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									} }
								>
									<ToggleControl
										checked={ anyToolsEnabled }
										onChange={ handleMasterToggle }
										label={ translate( 'Allow MCP access' ) }
									/>
									{ anyToolsEnabled && (
										<Button variant="secondary" href="/me/mcp-setup">
											{ translate( 'Configure MCP Client' ) }
										</Button>
									) }
								</div>
							) : (
								<Text as="p" variant="muted">
									{ translate( 'No MCP tools are currently available.' ) }
								</Text>
							) }

							{ hasTools && anyToolsEnabled && (
								<VStack spacing={ 3 }>
									<Heading level={ 4 }>{ translate( 'Account-level MCP Tools' ) }</Heading>
									<Text as="p" variant="muted">
										{ translate( 'Control which MCP tools are available across all your sites.' ) }
									</Text>
									<VStack spacing={ 4 }>
										{ tools.map( ( [ toolId, tool ] ) => (
											<ToggleControl
												key={ toolId }
												checked={ tool.enabled }
												onChange={ ( checked ) => handleToolChange( toolId, checked ) }
												label={ tool.title }
												help={ tool.description }
												disabled={ ! anyToolsEnabled }
											/>
										) ) }
									</VStack>
								</VStack>
							) }

							{ hasTools && anyToolsEnabled && (
								<VStack spacing={ 3 }>
									<Heading level={ 4 }>{ translate( 'Site-specific MCP settings' ) }</Heading>
									<Text as="p" variant="muted">
										{ createInterpolateElement(
											translate(
												'Account-level tools work across all sites. <a>Manage site-specific MCP settings</a> to control which tools are available on a specific site.'
											),
											{
												a: <a href="/sites" target="_blank" rel="noreferrer" />,
											}
										) }
									</Text>
								</VStack>
							) }

							{ hasTools && (
								<ButtonStack justify="flex-start">
									<FormButton
										isSubmitting={ isUpdating }
										disabled={ isUpdating || ! hasUnsavedChanges }
									>
										{ isUpdating ? translate( 'Saving…' ) : translate( 'Save MCP tools' ) }
									</FormButton>
								</ButtonStack>
							) }
						</VStack>
					</form>
				</CardBody>
			</Card>
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
