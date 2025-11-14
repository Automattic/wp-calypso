import { siteSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	CheckboxControl,
	ExternalLink,
	TextControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import type { Site, SiteSettings } from '@automattic/api-core';

interface AIAssistantFormData {
	bigSkyEnabled: boolean;
}

type UseCaseOption = 'redesign' | 'content' | 'questions' | 'images' | 'other';

const USE_CASE_OPTIONS: Array< { value: UseCaseOption; label: string } > = [
	{ value: 'questions', label: __( 'General help and questions' ) },
	{ value: 'content', label: __( 'Make changes to my site content' ) },
	{ value: 'redesign', label: __( 'Redesign my site' ) },
	{ value: 'images', label: __( 'Create and edit images' ) },
	{ value: 'other', label: __( 'Other' ) },
];

const getUseCaseDescription = (
	useCase: UseCaseOption,
	siteEditorUrl: string,
	blockEditorUrl: string,
	mediaLibraryUrl: string
) => {
	switch ( useCase ) {
		case 'redesign':
			return createInterpolateElement(
				__(
					'Head over to the <siteEditorLink>site editor</siteEditorLink> to start redesigning your site.'
				),
				{
					siteEditorLink: <ExternalLink href={ siteEditorUrl } children={ null } />,
				}
			);
		case 'content':
			return createInterpolateElement(
				__(
					'Use the AI assistant in the <blockEditorLink>block editor</blockEditorLink> to get help building or editing content.'
				),
				{
					blockEditorLink: <ExternalLink href={ blockEditorUrl } children={ null } />,
				}
			);
		case 'questions':
			return __( 'Ask questions in the AI assistant chat interface.' );
		case 'images':
			return createInterpolateElement(
				__(
					'Access Image Studio from the <mediaLibraryLink>media library</mediaLibraryLink> to create and edit images.'
				),
				{
					mediaLibraryLink: <ExternalLink href={ mediaLibraryUrl } children={ null } />,
				}
			);
		case 'other':
			return __( 'Explore AI features throughout your WordPress dashboard.' );
	}
};

export function AIAssistantForm( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const [ initialData, setInitialData ] = useState< AIAssistantFormData >( () =>
		fromSiteSettings( settings )
	);
	const [ formData, setFormData ] = useState< AIAssistantFormData >( () => ( {
		...initialData,
	} ) );
	const [ selectedUseCases, setSelectedUseCases ] = useState< Set< UseCaseOption > >(
		() => new Set()
	);
	const [ otherText, setOtherText ] = useState( '' );

	const isAlreadyEnabled = initialData.bigSkyEnabled;
	const isEnabled = formData.bigSkyEnabled || isAlreadyEnabled;

	const siteEditorUrl = site?.URL + '/wp-admin/site-editor.php?canvas=edit';
	const blockEditorUrl = site?.URL + '/wp-admin/post-new.php';
	const mediaLibraryUrl = site?.URL + '/wp-admin/upload.php';

	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'AI Site Assistant settings saved.' ),
				error: __( 'Failed to save AI Site Assistant settings.' ),
			},
		},
	} );

	const hasSelection = selectedUseCases.size > 0;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const settingsUpdate = toSiteSettings( { bigSkyEnabled: true }, selectedUseCases );

		mutation.mutate( settingsUpdate, {
			onSuccess: () => {
				// Update initialData to reflect that Big Sky is now enabled
				setInitialData( { bigSkyEnabled: true } );
				setFormData( { bigSkyEnabled: true } );
			},
		} );
	};

	const handleUseCaseChange = ( value: UseCaseOption, checked: boolean ) => {
		setSelectedUseCases( ( prev ) => {
			const newSet = new Set( prev );
			if ( checked ) {
				newSet.add( value );
			} else {
				newSet.delete( value );
				if ( value === 'other' ) {
					setOtherText( '' );
				}
			}
			return newSet;
		} );
	};

	const handleDisable = () => {
		const settingsUpdate = toSiteSettings( { bigSkyEnabled: false }, new Set() );

		mutation.mutate( settingsUpdate, {
			onSuccess: () => {
				setInitialData( { bigSkyEnabled: false } );
				setFormData( { bigSkyEnabled: false } );
				setSelectedUseCases( new Set() );
				setOtherText( '' );
			},
		} );
	};

	// Show all descriptions whenever Big Sky is enabled
	if ( isEnabled ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Notice variant="success" density="medium">
							{ __( 'AI Site Assistant is enabled! You have access to a lot of cool stuff.' ) }
						</Notice>
						<VStack spacing={ 3 }>
							{ USE_CASE_OPTIONS.map( ( option ) => (
								<div key={ option.value }>
									<strong>{ option.label }</strong>
									<p style={ { marginTop: '8px', marginBottom: 0 } }>
										{ getUseCaseDescription(
											option.value,
											siteEditorUrl,
											blockEditorUrl,
											mediaLibraryUrl
										) }
									</p>
								</div>
							) ) }
						</VStack>
						<ButtonStack justify="flex-start">
							<Button
								variant="secondary"
								__next40pxDefaultSize
								onClick={ handleDisable }
								isBusy={ isPending }
								disabled={ isPending }
							>
								{ __( 'Disable AI Site Assistant' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<Text weight={ 500 }>{ __( 'How do you plan to use the AI Site Assistant?' ) }</Text>
						<Text variant="muted" lineHeight="20px">
							{ __(
								'Your choices help to personalize setup. You’ll still have access to everything.'
							) }
						</Text>
						<VStack spacing={ 3 }>
							{ USE_CASE_OPTIONS.map( ( option ) => (
								<div key={ option.value }>
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ option.label }
										checked={ selectedUseCases.has( option.value ) }
										onChange={ ( checked ) => handleUseCaseChange( option.value, checked ) }
									/>
									{ option.value === 'other' && selectedUseCases.has( 'other' ) && (
										<div style={ { marginInlineStart: '32px', marginTop: '8px' } }>
											<TextControl
												value={ otherText }
												onChange={ setOtherText }
												placeholder={ __( 'Type your own use case' ) }
											/>
										</div>
									) }
								</div>
							) ) }
						</VStack>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								__next40pxDefaultSize
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || ! hasSelection }
							>
								{ __( 'Enable AI Site Assistant' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}

function fromSiteSettings( settings: SiteSettings ): AIAssistantFormData {
	return {
		bigSkyEnabled: Boolean( settings.big_sky_enable ),
	};
}

function toSiteSettings(
	formData: AIAssistantFormData,
	selectedUseCases: Set< UseCaseOption >
): Partial< SiteSettings > {
	const settings: Partial< SiteSettings > = {
		big_sky_enable: formData.bigSkyEnabled,
	};

	if ( ! formData.bigSkyEnabled ) {
		// Set isOnboarded to false when Big Sky is disabled
		settings.big_sky_site_metadata = {
			isOnboarded: false,
		};
	} else if ( ! selectedUseCases.has( 'redesign' ) ) {
		// If "Redesign my site" is NOT selected, set isOnboarded to true
		settings.big_sky_site_metadata = {
			isOnboarded: true,
		};
	}

	return settings;
}
