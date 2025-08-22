import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import {
	siteStaticFile404SettingQuery,
	siteStaticFile404SettingMutation,
} from '../../app/queries/site-static-file-404';
import PageLayout from '../../components/page-layout';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SettingsPageHeader from '../settings-page-header';
import type { Field } from '@wordpress/dataviews';

const fields: Field< { setting: string } >[] = [
	{
		id: 'setting',
		label: __( 'Server response' ),
		Edit: 'radio',
		elements: [
			{
				value: 'default',
				label: __( 'Default' ),
				description: __( 'Use the setting that WordPress.com has decided is the best option.' ),
			},
			{
				value: 'lightweight',
				label: __( 'Send a lightweight File-Not-Found page' ),
				description: __(
					'Let the server handle static file 404 requests. This option is more performant than the others because it doesn’t load the WordPress core code when handling nonexistent assets.'
				),
			},
			{
				value: 'wordpress',
				label: __( 'Delegate request to WordPress' ),
				description: __( 'Let WordPress handle static file 404 requests.' ),
			},
		],
	},
];

const form = {
	layout: { type: 'regular' as const, labelPosition: 'none' as const },
	fields: [ 'setting' ],
};

export default function SiteStaticFile404Settings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: currentSetting } = useQuery( {
		...siteStaticFile404SettingQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.STATIC_FILE_404 ),
	} );
	const mutation = useMutation( siteStaticFile404SettingMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< { setting: string } >( {
		setting: currentSetting ?? 'default',
	} );

	const isDirty = formData.setting !== currentSetting;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.setting, {
			onSuccess: () => {
				createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Handling requests for nonexistent assets' ) }
					description={ __(
						'Choose how to handle requests for assets (like images, fonts, or JavaScript) that don’t exist on your site.'
					) }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.STATIC_FILE_404 }
				tracksFeatureId="settings-static-file-404"
			>
				<Card>
					<CardBody>
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< { setting: string } >
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: { setting?: string } ) => {
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
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
