import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { Card, CardBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { hasSubscriptionGiftingFeature } from './utils';
import type { SiteSettings } from '../../data/types';
import type { Field } from '@automattic/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_gifting_subscription',
		label: __( 'Allow site visitors to gift your plan and domain renewal costs' ),
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<ToggleControl
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
	fields,
};

export default function SubscriptionGiftingSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: siteData } = useQuery( siteQuery( siteSlug ) );
	const { data } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	if ( ! data || ! siteData ) {
		return null;
	}

	if ( ! hasSubscriptionGiftingFeature( siteData.site ) ) {
		throw notFound();
	}

	const handleSubmit = ( edits: Partial< SiteSettings > ) => {
		return mutation.mutate( edits );
	};

	return (
		<PageLayout size="small">
			<SettingsPageHeader
				title={ __( 'Accept a gift subscription' ) }
				description={ __(
					'Allow a site visitor to cover the full cost of your site’s WordPress.com plan.'
				) }
			/>
			<Card>
				<CardBody>
					<DataForm< SiteSettings >
						data={ data }
						fields={ fields }
						form={ form }
						onChange={ handleSubmit }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
