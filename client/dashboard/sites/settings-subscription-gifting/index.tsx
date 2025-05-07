import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import { siteSettingsSubscriptionGiftingRoute } from '../../app/router';
import PageLayout from '../../components/page-layout';
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

export function getSubscriptionGiftingSettingBadges( settings: SiteSettings ) {
	return settings.wpcom_gifting_subscription
		? [ { text: __( 'Enabled' ), intent: 'success' as const } ]
		: [ { text: __( 'Disabled' ) } ];
}

export default function SubscriptionGiftingSettings() {
	const { siteSlug } = siteSettingsSubscriptionGiftingRoute.useParams();
	const { data } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	if ( ! data ) {
		return null;
	}

	const handleSubmit = ( edits: Partial< SiteSettings > ) => {
		return mutation.mutate( edits );
	};

	return (
		<PageLayout
			size="small"
			title={ __( 'Accept a gift subscription' ) }
			description={ __(
				'Allow a site visitor to cover the full cost of your site’s WordPress.com plan.'
			) }
		>
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
