import { siteBySlugQuery, siteSettingsMutation, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, CheckboxControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { isHolidaySnowAvailable } from './utils';
import type { SiteSettings } from '@automattic/api-core';
import type { Field, FormField } from '@wordpress/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'jetpack_holiday_snow_enabled',
		label: __( 'Show falling snow on my site until January 4th' ),
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
	fields: [ { id: 'jetpack_holiday_snow_enabled' } as FormField ],
};

export default function HolidaySnowSettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data } = useQuery( siteSettingsQuery( site.ID ) );
	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				error: __( 'Failed to save holiday snow settings.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState( {
		jetpack_holiday_snow_enabled: !! data?.jetpack_holiday_snow_enabled,
	} );

	if ( ! data ) {
		return null;
	}

	if ( ! isHolidaySnowAvailable( site ) ) {
		throw notFound();
	}

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => !! data[ key as keyof SiteSettings ] !== value
	);

	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ ...formData },
			{
				onSuccess: () => {
					createSuccessNotice(
						formData.jetpack_holiday_snow_enabled
							? __( 'Holiday snow enabled.' )
							: __( 'Holiday snow disabled.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 2 } /> } /> }>
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
