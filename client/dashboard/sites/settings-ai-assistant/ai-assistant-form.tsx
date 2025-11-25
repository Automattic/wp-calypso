import { bigSkyPluginMutation, bigSkyPluginQuery } from '@automattic/api-queries';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import ConfirmModal from '../../components/confirm-modal';
import Notice from '../../components/notice';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import type { BigSkyPluginUpdateRequest, Site } from '@automattic/api-core';

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
	siteSpecUrl: string,
	mediaLibraryUrl: string
) => {
	switch ( useCase ) {
		case 'redesign':
			return createInterpolateElement(
				__(
					'Head over to the <siteSpecLink>site spec</siteSpecLink> to start redesigning your site.'
				),
				{
					siteSpecLink: <ExternalLink href={ siteSpecUrl } children={ null } />,
				}
			);
		case 'content':
			return createInterpolateElement(
				__(
					'Use the WordPress AI Assistant in the <siteEditorLink>site editor</siteEditorLink> to get help building or editing content.'
				),
				{
					siteEditorLink: <ExternalLink href={ siteEditorUrl } children={ null } />,
				}
			);
		case 'questions':
			return __( 'Ask questions in the WordPress AI Assistant chat interface.' );
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

export function AIAssistantForm( { site }: { site: Site } ) {
	const [ selectedUseCases, setSelectedUseCases ] = useState< Set< UseCaseOption > >(
		() => new Set()
	);
	const [ otherText, setOtherText ] = useState( '' );
	const [ showDisableConfirm, setShowDisableConfirm ] = useState( false );
	const [ lastAction, setLastAction ] = useState< 'enable' | 'disable' | null >( null );

	const { data: pluginStatus } = useQuery( bigSkyPluginQuery( site.ID ) );

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'WordPress AI Assistant settings saved.' ),
				error: __( 'Failed to save WordPress AI Assistant settings.' ),
			},
		},
	} );

	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	if ( ! isAvailable ) {
		return (
			<UpsellCallout
				site={ site }
				upsellId="ai-assistant"
				upsellTitle={ __( 'WordPress AI Assistant' ) }
				upsellPlanRequirement="any"
				upsellDescription={ __(
					'Get AI-powered assistance to help you build, edit, and redesign your site with ease.'
				) }
				upsellIcon={ <BigSkyLogo.CentralLogo heartless size={ 24 } fill="#1e1e1e" /> }
			/>
		);
	}

	const siteEditorUrl = site?.URL + '/wp-admin/site-editor.php?canvas=edit';
	const siteSpecUrl = site?.URL + '/wp-admin/site-editor.php?canvas=edit&ai-step=spec';
	const mediaLibraryUrl = site?.URL + '/wp-admin/upload.php';

	const hasSelection = selectedUseCases.size > 0;
	const { isPending, isSuccess } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const pluginUpdate = toBigSkyPluginUpdate( { bigSkyEnabled: true } );

		setLastAction( 'enable' );
		mutation.mutate( pluginUpdate );
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

	const performDisable = () => {
		const pluginUpdate = toBigSkyPluginUpdate( { bigSkyEnabled: false } );

		setLastAction( 'disable' );
		mutation.mutate( pluginUpdate, {
			onSuccess: () => {
				setSelectedUseCases( new Set() );
				setOtherText( '' );
				setShowDisableConfirm( false );
			},
		} );
	};

	const handleDisable = () => {
		if ( isFreeTrial ) {
			setShowDisableConfirm( true );
			return;
		}

		performDisable();
	};

	// Show all descriptions whenever Big Sky is enabled
	if ( isEnabled ) {
		return (
			<>
				{ isSuccess && lastAction === 'enable' && (
					<Notice variant="success" density="medium">
						{ __( 'WordPress AI Assistant is enabled! You have access to a lot of cool stuff.' ) }
					</Notice>
				) }
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<VStack spacing={ 3 }>
								{ USE_CASE_OPTIONS.map( ( option ) => (
									<div key={ option.value }>
										<strong>{ option.label }</strong>
										<p style={ { marginTop: '8px', marginBottom: 0 } }>
											{ getUseCaseDescription(
												option.value,
												siteEditorUrl,
												siteSpecUrl,
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
									{ __( 'Disable WordPress AI Assistant' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</CardBody>
				</Card>
				{ isFreeTrial && (
					<ConfirmModal
						isOpen={ showDisableConfirm }
						onCancel={ () => setShowDisableConfirm( false ) }
						onConfirm={ performDisable }
						confirmButtonProps={ {
							label: __( 'Disable WordPress AI Assistant' ),
							isBusy: isPending,
							disabled: isPending,
						} }
					>
						{ __(
							'You are on a free trial. If you disable WordPress AI Assistant, you will not be able to turn it back on without a paid plan.'
						) }
					</ConfirmModal>
				) }
			</>
		);
	}

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<Text weight={ 500 }>
							{ __( 'How do you plan to use the WordPress AI Assistant?' ) }
						</Text>
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
								{ __( 'Enable WordPress AI Assistant' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}

function toBigSkyPluginUpdate( formData: AIAssistantFormData ): BigSkyPluginUpdateRequest {
	return {
		enable: formData.bigSkyEnabled,
	};
}
