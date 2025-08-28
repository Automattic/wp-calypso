import { JetpackModules } from '@automattic/api-core';
import {
	siteJetpackModulesQuery,
	siteJetpackModulesMutation,
	siteJetpackSettingsQuery,
	siteJetpackSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import {
	jetpackModuleRequiresConnection,
	isJetpackModuleActivated,
} from '../../utils/site-jetpack-modules';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type WpcomLoginFormData = {
	sso: boolean;
	jetpack_sso_match_by_email: boolean;
	jetpack_sso_require_two_step: boolean;
};

export default function SsoForm( { site }: { site: Site } ) {
	const { data: jetpackModules } = useSuspenseQuery( siteJetpackModulesQuery( site.ID ) );
	const { data: jetpackSettings } = useSuspenseQuery( siteJetpackSettingsQuery( site.ID ) );

	const jetpackModulesMutation = useMutation( siteJetpackModulesMutation( site.ID ) );
	const jetpackSettingsMutation = useMutation( siteJetpackSettingsMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const ssoAvailable =
		jetpackModuleRequiresConnection( jetpackModules, JetpackModules.SSO ) &&
		site.jetpack_connection;

	const currentSso = isJetpackModuleActivated( jetpackModules, JetpackModules.SSO );
	const currentMatchByEmail = jetpackSettings?.jetpack_sso_match_by_email ?? false;
	const currentRequireTwoStep = jetpackSettings?.jetpack_sso_require_two_step ?? false;

	const [ formData, setFormData ] = useState< WpcomLoginFormData >( {
		sso: currentSso,
		jetpack_sso_match_by_email: currentMatchByEmail,
		jetpack_sso_require_two_step: currentRequireTwoStep,
	} );

	const fields: Field< WpcomLoginFormData >[] = [
		{
			id: 'sso',
			label: __( 'Allow users to log in to this site using WordPress.com accounts' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { getValue, id, label } = field;
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ getValue( { item: data } ) || false }
						disabled={ ! data.sso || ! ssoAvailable }
						help={ __( 'Use WordPress.com’s secure authentication.' ) }
						label={ hideLabelFromVision ? '' : label }
						onChange={ () => {
							onChange( { [ id ]: ! getValue( { item: data } ) } );
						} }
					/>
				);
			},
		},
		{
			id: 'jetpack_sso_match_by_email',
			label: __( 'Match accounts using email addresses' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { getValue, id, label } = field;
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ getValue( { item: data } ) || false }
						disabled={ ! data.sso || ! ssoAvailable }
						label={ hideLabelFromVision ? '' : label }
						onChange={ () => {
							onChange( { [ id ]: ! getValue( { item: data } ) } );
						} }
					/>
				);
			},
		},
		{
			id: 'jetpack_sso_require_two_step',
			label: __( 'Require two-step authentication' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { getValue, id, label } = field;
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ getValue( { item: data } ) || false }
						disabled={ ! data.sso || ! ssoAvailable }
						label={ hideLabelFromVision ? '' : label }
						onChange={ () => {
							onChange( { [ id ]: ! getValue( { item: data } ) } );
						} }
					/>
				);
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'sso', 'jetpack_sso_match_by_email', 'jetpack_sso_require_two_step' ],
	};

	const isModuleDirty = formData.sso !== currentSso;
	const areSettingsDirty =
		formData.jetpack_sso_match_by_email !== currentMatchByEmail ||
		formData.jetpack_sso_require_two_step !== currentRequireTwoStep;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( isModuleDirty ) {
			jetpackModulesMutation.mutate(
				{ module: 'sso', value: formData.sso },
				{
					onSuccess: () => {
						createSuccessNotice(
							formData.sso
								? __( 'WordPress.com login enabled.' )
								: __( 'WordPress.com login disabled.' ),
							{ type: 'snackbar' }
						);
					},
					onError: () => {
						createErrorNotice(
							formData.sso
								? __( 'Failed to enable WordPress.com login.' )
								: __( 'Failed to disable WordPress.com login.' ),
							{ type: 'snackbar' }
						);
					},
				}
			);
		}

		if ( areSettingsDirty ) {
			jetpackSettingsMutation.mutate(
				{
					jetpack_sso_match_by_email: formData.jetpack_sso_match_by_email,
					jetpack_sso_require_two_step: formData.jetpack_sso_require_two_step,
				},
				// Avoid showing a double notification if both module and settings have been changed.
				! isModuleDirty
					? {
							onSuccess: () => {
								createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
							},
							onError: () => {
								createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
							},
					  }
					: {}
			);
		}
	};

	const isDirty = isModuleDirty || areSettingsDirty;
	const { isPending: isJetpackModulesPending } = jetpackModulesMutation;
	const { isPending: isJetpackSettingsPending } = jetpackSettingsMutation;

	return (
		<>
			{ ! ssoAvailable && (
				<Notice>
					<Text as="p">
						{ createInterpolateElement(
							__(
								'The WordPress.com login feature is disabled because your site is in development mode. <link>Learn more</link>'
							),
							{
								// @ts-ignore - ExternalLink's children is not missing but it's provided by the createInterpolateElement above.
								link: <ExternalLink href="https://jetpack.com/support/offline-mode/" />,
							}
						) }
					</Text>
				</Notice>
			) }

			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< WpcomLoginFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< WpcomLoginFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isJetpackModulesPending || isJetpackSettingsPending }
									disabled={
										isJetpackModulesPending ||
										isJetpackSettingsPending ||
										! isDirty ||
										! ssoAvailable
									}
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</>
	);
}
