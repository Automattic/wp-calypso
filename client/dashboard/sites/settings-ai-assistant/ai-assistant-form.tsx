import { siteSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	CheckboxControl,
	ExternalLink,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import type { Site, SiteSettings } from '@automattic/api-core';

interface AIAssistantFormData {
	bigSkyEnabled: boolean;
}

export function AIAssistantForm( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const [ initialData, setInitialData ] = useState< AIAssistantFormData >( () =>
		fromSiteSettings( settings )
	);
	const [ formData, setFormData ] = useState< AIAssistantFormData >( () => ( {
		...initialData,
	} ) );
	const [ showOnboardingNotice, setShowOnboardingNotice ] = useState( false );

	const isOnboarded = settings?.big_sky_site_metadata?.isOnboarded;
	const siteEditorUrl = site?.URL + '/wp-admin/site-editor.php?canvas=edit';

	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'AI Site Assistant settings saved.' ),
				error: __( 'Failed to save AI Site Assistant settings.' ),
			},
		},
	} );

	const isDirty = Object.entries( initialData ).some(
		( [ key, value ] ) => formData[ key as keyof AIAssistantFormData ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( toSiteSettings( formData ), {
			onSuccess: () => {
				// Check if Big Sky was just enabled (changed from disabled to enabled)
				const wasPreviouslyDisabled = ! initialData.bigSkyEnabled;
				const isNowEnabled = formData.bigSkyEnabled;
				const wasJustEnabled = wasPreviouslyDisabled && isNowEnabled;

				if ( wasJustEnabled ) {
					setShowOnboardingNotice( true );
				}

				// Update initialData to match the saved formData so the form knows it's clean
				setInitialData( { ...formData } );
			},
		} );
	};

	const handleChange = ( edits: Partial< AIAssistantFormData > ) => {
		setFormData( ( data ) => {
			const newData = { ...data, ...edits };
			// Hide notice if Big Sky is disabled
			if ( edits.bigSkyEnabled === false ) {
				setShowOnboardingNotice( false );
			}
			return newData;
		} );
	};

	const handleRedesignSite = () => {
		// TODO: Implement redirect to redesign flow
		window.location.href = siteEditorUrl;
	};

	const onboardingMutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Onboarding status updated.' ),
				error: __( 'Failed to update onboarding status.' ),
			},
		},
	} );

	const handleContinueWithDesign = () => {
		// Update big_sky_site_metadata to mark as onboarded
		const metadataUpdate = {
			big_sky_site_metadata: {
				isOnboarded: true,
			},
		};
		onboardingMutation.mutate( metadataUpdate, {
			onSuccess: () => {
				// Redirect to site editor after successful save
				window.location.href = siteEditorUrl;
			},
		} );
	};

	return (
		<>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							{ showOnboardingNotice && isOnboarded && (
								<Notice variant="success" density="medium">
									{ createInterpolateElement(
										__(
											'Enabled! Head over to the <siteEditorLink>site editor</siteEditorLink> to start using it.'
										),
										{
											siteEditorLink: <ExternalLink href={ siteEditorUrl } children={ null } />,
										}
									) }
								</Notice>
							) }
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Enable Big Sky' ) }
								checked={ formData.bigSkyEnabled }
								onChange={ ( checked ) => handleChange( { bigSkyEnabled: checked } ) }
								help={ __( 'Enable Big Sky features for this site.' ) }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									__next40pxDefaultSize
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
			{ ! isOnboarded && formData.bigSkyEnabled && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack spacing={ 2 }>
								<Icon icon={ check } style={ { color: '#00A32A' } } />
								<Text as="p" weight={ 500 }>
									{ __( 'Enabled!' ) }
								</Text>
							</HStack>
							<Text as="p">
								{ __(
									'It looks like this is your first time using the site assistant on this site. Would you like to redesign your site or continue with your own design?'
								) }
							</Text>
							<ButtonStack justify="flex-start">
								<Button variant="primary" __next40pxDefaultSize onClick={ handleRedesignSite }>
									{ __( 'Redesign my site' ) }
								</Button>
								<Button
									variant="secondary"
									__next40pxDefaultSize
									onClick={ handleContinueWithDesign }
									isBusy={ onboardingMutation.isPending }
									disabled={ onboardingMutation.isPending }
								>
									{ __( 'Continue with my own design' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</CardBody>
				</Card>
			) }
		</>
	);
}

function fromSiteSettings( settings: SiteSettings ): AIAssistantFormData {
	return {
		bigSkyEnabled: Boolean( settings.big_sky_enable ),
	};
}

function toSiteSettings( formData: AIAssistantFormData ): Partial< SiteSettings > {
	const settings: Partial< SiteSettings > = {
		big_sky_enable: formData.bigSkyEnabled,
	};

	// Set isOnboarded to false when Big Sky is disabled
	if ( ! formData.bigSkyEnabled ) {
		settings.big_sky_site_metadata = {
			isOnboarded: false,
		};
	}

	return settings;
}
