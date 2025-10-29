import { HostingFeatures } from '@automattic/api-core';
import {
	sitePHPVersionQuery,
	sitePHPVersionMutation,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RequiredSelect from '../../components/required-select';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import type { Field } from '@wordpress/dataviews';

export default function PHPVersionSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: currentVersion } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PHP ),
	} );
	const mutation = useMutation( {
		...sitePHPVersionMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'PHP version saved.' ),
				error: __( 'Failed to save PHP version.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

	const { phpVersions } = getPHPVersions();

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'PHP version' ),
			Edit: RequiredSelect, // TODO: use DataForm's validation when available. See: DOTCOM-13298
			elements: phpVersions.filter( ( option ) => {
				// Show disabled PHP version only if the site is still using it.
				if ( option.disabled && option.value !== currentVersion ) {
					return false;
				}
				return true;
			} ),
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

	const description = hasPlanFeature( site, HostingFeatures.PHP )
		? undefined
		: sprintf(
				/* translators: %s: plan name. Eg. 'Personal' */
				__( 'Sites on the %s plan run on our recommended PHP version.' ),
				getSitePlanDisplayName( site )
		  );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="PHP"
					description={ description }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.PHP }
				upsellId="site-settings-php"
			>
				<Card>
					<CardBody>
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
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
