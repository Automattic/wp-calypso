import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteSettingsMutation, siteSettingsQuery } from '../../app/queries/site-settings';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import { DotcomFeatures } from '../../data/constants';
import { hasPlanFeature } from '../../utils/site-features';
import SettingsPageHeader from '../settings-page-header';
import type { SiteSettings } from '../../data/types';
import type { Field, SimpleFormField } from '@wordpress/dataviews';

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
	type: 'regular' as const,
	fields: [ { id: 'wpcom_gifting_subscription' } as SimpleFormField ],
};

export default function SubscriptionGiftingSettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data } = useQuery( siteSettingsQuery( site.ID ) );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	const [ formData, setFormData ] = useState( {
		wpcom_gifting_subscription: data?.wpcom_gifting_subscription,
	} );

	if ( ! data ) {
		return null;
	}

	if ( ! hasPlanFeature( site, DotcomFeatures.SUBSCRIPTION_GIFTING ) ) {
		throw notFound();
	}

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
				<SettingsPageHeader
					title={ __( 'Accept a gift subscription' ) }
					description={ createInterpolateElement(
						__(
							'Allow a site visitor to cover the full cost of your site’s WordPress.com plan. <link>Learn more</link>'
						),
						{
							link: <InlineSupportLink supportContext="gift-a-subscription" />,
						}
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< SiteSettings >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< SiteSettings > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<HStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
