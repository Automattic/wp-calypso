import { JetpackModules } from '@automattic/api-core';
import { siteJetpackModulesQuery, siteJetpackModulesMutation } from '@automattic/api-queries';
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
import { SectionHeader } from '../../components/section-header';
import {
	jetpackModuleRequiresConnection,
	isJetpackModuleActivated,
} from '../../utils/site-jetpack-modules';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type ProtectFormData = {
	protect: boolean;
};

export default function ProtectForm( { site }: { site: Site } ) {
	const { data: jetpackModules } = useSuspenseQuery( siteJetpackModulesQuery( site.ID ) );
	const mutation = useMutation( siteJetpackModulesMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const protectAvailable =
		jetpackModuleRequiresConnection( jetpackModules, JetpackModules.SSO ) &&
		site.jetpack_connection;

	const currentProtect = isJetpackModuleActivated( jetpackModules, JetpackModules.PROTECT );

	const [ formData, setFormData ] = useState< { protect: boolean } >( {
		protect: currentProtect,
	} );

	const fields: Field< ProtectFormData >[] = [
		{
			id: 'protect',
			label: __( 'Enable brute force login protection' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { getValue, id, label } = field;
				return (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ getValue( { item: data } ) || false }
						disabled={ ! protectAvailable }
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
		fields: [ 'protect' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ module: 'protect', value: formData.protect },
			{
				onSuccess: () => {
					createSuccessNotice(
						formData.protect
							? __( 'Brute force login protection enabled.' )
							: __( 'Brute force login protection disabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice(
						formData.protect
							? __( 'Failed to enable brute force login protection.' )
							: __( 'Failed to disable brute force login protection.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	const isDirty = formData.protect !== currentProtect;
	const { isPending } = mutation;

	return (
		<>
			{ ! protectAvailable && (
				<Notice>
					<Text as="p">
						{ createInterpolateElement(
							__(
								'The brute force login protection is disabled because your site is in development mode. <link>Learn more</link>'
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
							<SectionHeader
								title={ __( 'Brute force login protection' ) }
								description={ __(
									'Prevent and block unwanted login attempts from bots and hackers attempting to log in to your website with common username and password combinations.'
								) }
								level={ 3 }
							/>
							<DataForm< { protect: boolean } >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: { protect?: boolean } ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty || ! protectAvailable }
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
