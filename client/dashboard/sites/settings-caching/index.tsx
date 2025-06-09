import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import {
	siteQuery,
	siteEdgeCacheStatusQuery,
	siteEdgeCacheStatusMutation,
	siteEdgeCacheClearMutation,
	siteObjectCacheClearMutation,
} from '../../app/queries';
import { ActionList } from '../../components/action-list';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import {
	canUpdateCaching,
	isEdgeCacheAvailable as getIsEdgeCacheAvailable,
} from '../../utils/site-features';
import SettingsCallout from '../settings-callout';
import SettingsPageHeader from '../settings-page-header';
import type { Field } from '@automattic/dataviews';

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
	type: 'regular' as const,
	fields: [ 'active' ],
};

export default function CachingSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canUpdate = site && canUpdateCaching( site );

	const { data: isEdgeCacheActive } = useQuery( {
		...siteEdgeCacheStatusQuery( siteSlug ),
		enabled: canUpdate,
	} );
	const edgeCacheStatusMutation = useMutation( siteEdgeCacheStatusMutation( siteSlug ) );
	const edgeCacheClearMutation = useMutation( siteEdgeCacheClearMutation( siteSlug ) );
	const objectCacheClearMutation = useMutation( siteObjectCacheClearMutation( siteSlug ) );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const isEdgeCacheAvailable = site && getIsEdgeCacheAvailable( site );
	const isEdgeCacheEnabled = isEdgeCacheAvailable && isEdgeCacheActive;

	const [ formData, setFormData ] = useState< CachingFormData >( {
		active: isEdgeCacheEnabled ?? false,
	} );

	const isDirty = isEdgeCacheEnabled !== formData.active;
	const { isPending } = edgeCacheStatusMutation;

	const handleUpdateEdgeCacheStatus = ( e: React.FormEvent ) => {
		e.preventDefault();
		edgeCacheStatusMutation.mutate( formData.active, {
			onSuccess: () => {
				createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
			},
		} );
	};

	const handleClearEdgeCache = () => {
		edgeCacheClearMutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Global edge cache cleared.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to clear edge cache.' ), { type: 'snackbar' } );
			},
		} );
	};

	const handleClearObjectCache = () => {
		objectCacheClearMutation.mutate( 'Manually clearing again.', {
			onSuccess: () => {
				createSuccessNotice( __( 'Object cache cleared.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to clear object cache.' ), { type: 'snackbar' } );
			},
		} );
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

	const renderCallout = () => {
		return <SettingsCallout siteSlug={ siteSlug } tracksId="caching" />;
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
		);
	};

	const renderActions = () => {
		return (
			<VStack spacing={ 4 }>
				<ActionList
					title={ __( 'Clear caches' ) }
					description={ __( 'Clearing the cache may temporarily make your site less responsive.' ) }
				>
					<ActionList.ActionItem
						title={ __( 'Global edge cache' ) }
						description={ __( 'Edge caching enables faster content delivery.' ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearEdgeCache }
								isBusy={ edgeCacheClearMutation.isPending && ! isClearingAllCaches }
								disabled={
									! isEdgeCacheEnabled || edgeCacheClearMutation.isPending || isClearingAllCaches
								}
							>
								{ __( 'Clear' ) }
							</Button>
						}
					/>
					<ActionList.ActionItem
						title={ __( 'Object cache' ) }
						description={ __( 'Data is cached using Memcached to reduce database lookups.' ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearObjectCache }
								isBusy={ objectCacheClearMutation.isPending && ! isClearingAllCaches }
								disabled={ objectCacheClearMutation.isPending || isClearingAllCaches }
							>
								{ __( 'Clear' ) }
							</Button>
						}
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						title={ __( 'Clear all caches' ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ handleClearAllCaches }
								isBusy={ isClearingAllCaches }
								disabled={ isClearingAllCaches }
							>
								{ __( 'Clear all' ) }
							</Button>
						}
					/>
				</ActionList>
			</VStack>
		);
	};

	const description = canUpdate
		? createInterpolateElement(
				__( 'Manage your site’s server-side caching. <link>Learn more</link>.' ),
				{
					link: <InlineSupportLink supportContext="hosting-edge-cache" />,
				}
		  )
		: '';

	return (
		<PageLayout
			size="small"
			header={ <SettingsPageHeader title={ __( 'Caching' ) } description={ description } /> }
		>
			{ canUpdate ? (
				<>
					{ renderForm() }
					{ renderActions() }
				</>
			) : (
				renderCallout()
			) }
		</PageLayout>
	);
}
