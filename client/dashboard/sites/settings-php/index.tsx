import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import { siteBySlugQuery } from '../../app/queries/site';
import { sitePHPVersionQuery, sitePHPVersionMutation } from '../../app/queries/site-php-version';
import PageLayout from '../../components/page-layout';
import RequiredSelect from '../../components/required-select';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SettingsPageHeader from '../settings-page-header';
import type { Field } from '@wordpress/dataviews';

export default function PHPVersionSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: currentVersion } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PHP ),
	} );
	const mutation = useMutation( sitePHPVersionMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

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
		type: 'regular' as const,
		fields: [ 'version' ],
	};

	const isDirty = formData.version !== currentVersion;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.version, {
			onSuccess: () => {
				createSuccessNotice( __( 'PHP version saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save PHP version.' ), {
					type: 'snackbar',
				} );
			},
		} );
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
			header={ <SettingsPageHeader title="PHP" description={ description } /> }
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.PHP }
				tracksFeatureId="settings-php"
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
