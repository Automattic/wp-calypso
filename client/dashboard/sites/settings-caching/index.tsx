import { HostingFeatures } from '@automattic/api-core';
import {
	siteEdgeCacheStatusQuery,
	siteEdgeCacheStatusMutation,
	siteEdgeCacheClearMutation,
	siteEdgeCacheLastClearedTimestampQuery,
	siteObjectCacheClearMutation,
	siteObjectCacheLastClearedTimestampQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Tooltip,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ActionList } from '../../components/action-list';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { isEdgeCacheAvailable as getIsEdgeCacheAvailable } from './utils';
import type { Field } from '@wordpress/dataviews';

type CachingFormData = {
	active: boolean;
};

const fields: Field< CachingFormData >[] = [
	{
		id: 'active',
		label: __( 'Enable global edge caching for faster content delivery' ),
		Edit: 'checkbox',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'active' ],
};

export default function CachingSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const canView = hasHostingFeature( site, HostingFeatures.CACHING );

	const { data: isEdgeCacheActive } = useQuery( {
		...siteEdgeCacheStatusQuery( site.ID ),
		enabled: canView,
	} );

	const { data: lastEdgeCacheClearedTimestamp = 0 } = useQuery( {
		...siteEdgeCacheLastClearedTimestampQuery( site.ID ),
		enabled: canView,
	} );

	const { data: lastObjectCacheClearedTimestamp = 0 } = useQuery( {
		...siteObjectCacheLastClearedTimestampQuery( site.ID ),
		enabled: canView,
	} );

	const isEdgeCacheAvailable = site && getIsEdgeCacheAvailable( site );
	const isEdgeCacheEnabled = isEdgeCacheAvailable && isEdgeCacheActive;

	const [ formData, setFormData ] = useState< CachingFormData >( {
		active: isEdgeCacheEnabled ?? false,
	} );

	const edgeCacheStatusMutation = useMutation( {
		...siteEdgeCacheStatusMutation( site.ID ),
		meta: {
			snackbar: {
				success: formData.active
					? __( 'Global edge cache enabled.' )
					: __( 'Global edge cache disabled.' ),
				error: __( 'Failed to save global edge cache settings.' ),
			},
		},
	} );
	const edgeCacheClearMutation = useMutation( {
		...siteEdgeCacheClearMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Global edge cache cleared.' ),
				error: __( 'Failed to clear global edge cache.' ),
			},
		},
	} );
	const objectCacheClearMutation = useMutation( {
		...siteObjectCacheClearMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Object cache cleared.' ),
				error: __( 'Failed to clear object cache.' ),
			},
		},
	} );

	const isDirty = isEdgeCacheEnabled !== formData.active;
	const { isPending } = edgeCacheStatusMutation;

	const handleUpdateEdgeCacheStatus = ( e: React.FormEvent ) => {
		e.preventDefault();
		edgeCacheStatusMutation.mutate( formData.active );
	};

	const handleClearEdgeCache = () => {
		edgeCacheClearMutation.mutate( undefined );
	};

	const handleClearObjectCache = () => {
		objectCacheClearMutation.mutate( 'Manually clearing again.' );
	};

	const [ isClearingAllCaches, setIsClearingAllCaches ] = useState( false );

	useEffect( () => {
		if ( ! edgeCacheClearMutation.isPending && ! objectCacheClearMutation.isPending ) {
			setIsClearingAllCaches( false );
		}
	}, [ edgeCacheClearMutation.isPending, objectCacheClearMutation.isPending ] );

	const handleClearAllCaches = () => {
		if ( isEdgeCacheEnabled ) {
			handleClearEdgeCache();
		}
		handleClearObjectCache();

		setIsClearingAllCaches( true );
	};

	const renderForm = () => {
		if ( ! isEdgeCacheAvailable ) {
			return (
				<Notice>
					<VStack>
						<Text as="p">
							{ __(
								'Faster content delivery with global edge caching is available for public sites.'
							) }
						</Text>
						<Text as="p">
							{ createInterpolateElement( __( '<a>Review site visibility settings</a>.' ), {
								a: <Link to={ `/sites/${ siteSlug }/settings/site-visibility` } />,
							} ) }
						</Text>
					</VStack>
				</Notice>
			);
		}

		return (
			<Card>
				<CardBody>
					<form onSubmit={ handleUpdateEdgeCacheStatus }>
						<VStack spacing={ 4 }>
							<DataForm< CachingFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< CachingFormData > ) => {
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
		);
	};

	const renderActions = () => {
		const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

		const isClearingEdgeCacheRateLimited =
			lastEdgeCacheClearedTimestamp > Date.now() - ONE_MINUTE_IN_MILLISECONDS;
		const isClearingObjectCacheRateLimited =
			lastObjectCacheClearedTimestamp > Date.now() - ONE_MINUTE_IN_MILLISECONDS;
		const isClearingAllCachesRateLimited =
			isClearingEdgeCacheRateLimited && isClearingObjectCacheRateLimited;

		const wrapMaybeDisabledButtonWithTooltip = (
			isButtonDisabled: boolean,
			tooltipText: string,
			button: JSX.Element
		) => {
			if ( ! isButtonDisabled ) {
				return button;
			}

			// We must wrap the disabled button in a div so that the hover event reaches the Tooltip component.
			return (
				<Tooltip text={ tooltipText } placement="top">
					<div>{ button }</div>
				</Tooltip>
			);
		};

		return (
			<VStack spacing={ 4 }>
				<ActionList
					title={ __( 'Clear caches' ) }
					description={ __( 'Clearing the cache may temporarily make your site less responsive.' ) }
				>
					<ActionList.ActionItem
						title={ __( 'Global edge cache' ) }
						description={ __( 'Edge caching enables faster content delivery.' ) }
						actions={ wrapMaybeDisabledButtonWithTooltip(
							isClearingEdgeCacheRateLimited,
							__(
								'You cleared the global edge cache recently. Please wait a minute and try again.'
							),
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearEdgeCache }
								isBusy={ edgeCacheClearMutation.isPending && ! isClearingAllCaches }
								disabled={
									! isEdgeCacheEnabled ||
									edgeCacheClearMutation.isPending ||
									isClearingEdgeCacheRateLimited ||
									isClearingAllCaches
								}
							>
								{ __( 'Clear' ) }
							</Button>
						) }
					/>

					<ActionList.ActionItem
						title={ __( 'Object cache' ) }
						description={ __( 'Data is cached using Memcached to reduce database lookups.' ) }
						actions={ wrapMaybeDisabledButtonWithTooltip(
							isClearingObjectCacheRateLimited,
							__( 'You cleared the object cache recently. Please wait a minute and try again.' ),
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearObjectCache }
								isBusy={ objectCacheClearMutation.isPending && ! isClearingAllCaches }
								disabled={
									objectCacheClearMutation.isPending ||
									isClearingObjectCacheRateLimited ||
									isClearingAllCaches
								}
							>
								{ __( 'Clear' ) }
							</Button>
						) }
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						title={ __( 'Clear all caches' ) }
						actions={ wrapMaybeDisabledButtonWithTooltip(
							isClearingAllCachesRateLimited,
							__( 'You cleared all caches recently. Please wait a minute and try again.' ),
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearAllCaches }
								isBusy={ isClearingAllCaches }
								disabled={ isClearingAllCachesRateLimited || isClearingAllCaches }
							>
								{ __( 'Clear all' ) }
							</Button>
						) }
					/>
				</ActionList>
			</VStack>
		);
	};

	const description = hasPlanFeature( site, HostingFeatures.CACHING )
		? createInterpolateElement( __( 'Manage your site’s server-side caching. <learnMoreLink />' ), {
				learnMoreLink: <InlineSupportLink supportContext="hosting-edge-cache" />,
		  } )
		: createInterpolateElement(
				sprintf(
					/* translators: %s: plan name. Eg. 'Personal' */
					__(
						'Caching is managed for you on the %s plan. The cache is cleared automatically as you make changes to your site. <learnMoreLink />'
					),
					getSitePlanDisplayName( site )
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="hosting-edge-cache" />,
				}
		  );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Caching' ) }
					description={ description }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.CACHING }
				upsellId="site-settings-caching"
			>
				{ renderForm() }
				{ renderActions() }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
