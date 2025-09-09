import { JetpackModule, JetpackModules, Site } from '@automattic/api-core';
import {
	siteJetpackModulesMutation,
	siteJetpackSettingsQuery,
	siteJetpackSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { isJetpackModuleActivated } from '../../utils/site-jetpack-modules';
import type { Field } from '@wordpress/dataviews';

type WpcomLoginFormData = {
	sso: boolean;
	jetpack_sso_match_by_email: boolean;
	jetpack_sso_require_two_step: boolean;
};

const fields: Field< WpcomLoginFormData >[] = [
	{
		id: 'sso',
		label: __( 'Allow users to log in to this site using WordPress.com accounts' ),
		description: __( 'Use WordPress.com’s secure authentication.' ),
		Edit: 'checkbox',
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
					disabled={ ! data.sso }
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
					disabled={ ! data.sso }
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

export default function SsoForm( {
	jetpackModules,
	site,
}: {
	jetpackModules: Record< string, JetpackModule > | undefined;
	site: Site;
} ) {
	const { data: jetpackSettings } = useSuspenseQuery( siteJetpackSettingsQuery( site.ID ) );

	const jetpackModulesMutation = useMutation( siteJetpackModulesMutation( site.ID ) );
	const jetpackSettingsMutation = useMutation( siteJetpackSettingsMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const currentSso = isJetpackModuleActivated( jetpackModules, JetpackModules.SSO );
	const currentMatchByEmail = jetpackSettings?.jetpack_sso_match_by_email ?? false;
	const currentRequireTwoStep = jetpackSettings?.jetpack_sso_require_two_step ?? false;

	const [ formData, setFormData ] = useState< WpcomLoginFormData >( {
		sso: currentSso,
		jetpack_sso_match_by_email: currentMatchByEmail,
		jetpack_sso_require_two_step: currentRequireTwoStep,
	} );

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
								disabled={ isJetpackModulesPending || isJetpackSettingsPending || ! isDirty }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
