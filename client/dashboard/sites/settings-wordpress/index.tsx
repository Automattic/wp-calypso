import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import { formatWordPressVersion } from '../../utils/wp-version';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import type { Field } from '@wordpress/dataviews';

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const canView = hasHostingFeature( site, HostingFeatures.SFTP );

	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: canView,
	} );

	const { data: latestVersion } = useQuery( {
		...wpOrgCoreVersionQuery(),
		enabled: canView,
	} );
	const { data: betaVersion } = useQuery( {
		...wpOrgCoreVersionQuery( 'beta' ),
		enabled: canView,
	} );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'WordPress version saved.' ),
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

	const currentWpVersion = site.options?.software_version ?? '';

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'WordPress version' ),
			Edit: 'select',
			elements: [
				{
					value: 'latest',
					label: formatWordPressVersion( latestVersion ?? currentWpVersion, 'latest' ),
				},
				{
					value: 'beta',
					label: formatWordPressVersion( betaVersion ?? currentWpVersion, 'beta' ),
				},
			],
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'version' ],
	};

	const isDirty = formData.version !== currentVersion;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.version );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="WordPress"
					description={ __( 'Manage your WordPress version.' ) }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SFTP }
				upsellId="site-settings-wordpress"
			>
				<Card>
					<CardBody>
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<NavigationBlocker shouldBlock={ isDirty } />
								<DataForm< { version: string } >
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: { version?: string } ) => {
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
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
