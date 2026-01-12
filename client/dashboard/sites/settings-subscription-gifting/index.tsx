import { siteBySlugQuery, siteSettingsMutation, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, CheckboxControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { SiteSettings } from '@automattic/api-core';
import type { Field, FormField } from '@wordpress/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_gifting_subscription',
		label: __( 'Allow site visitors to gift your plan and domain renewal costs' ),
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					checked={ getValue( { item: data } ) }
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
	fields: [ { id: 'wpcom_gifting_subscription' } as FormField ],
};

export default function SubscriptionGiftingSettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	const [ formData, setFormData ] = useState( {
		wpcom_gifting_subscription: data.wpcom_gifting_subscription,
	} );

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => data[ key as keyof SiteSettings ] !== value
	);

	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ ...formData },
			{
				onSuccess: () => {
					createSuccessNotice(
						formData.wpcom_gifting_subscription
							? __( 'Gift subscription enabled.' )
							: __( 'Gift subscription disabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save gift subscription settings.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Accept a gift subscription' ) }
					description={ createInterpolateElement(
						__(
							'Allow a site visitor to cover the full cost of your site’s WordPress.com plan. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="gift-a-subscription" />,
						}
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<NavigationBlocker shouldBlock={ isDirty } />
							<DataForm< SiteSettings >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< SiteSettings > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
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
		</PageLayout>
	);
}
