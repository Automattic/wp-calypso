import { DotcomFeatures, Site } from '@automattic/api-core';
import { installPluginMutation, invalidatePlugins } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { Plan } from '../../sites/site-fields';
import { hasPlanFeature } from '../../utils/site-features';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { PluginSiteFieldContent } from './components/plugin-site-field-content';
import type { Action, Field } from '@wordpress/dataviews';

const defaultView: View = {
	type: 'table',
	fields: [ 'plan' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

type SitesWithoutThisPluginProps = {
	pluginSlug: string;
	pluginName?: string;
	isLoading: boolean;
	sitesWithoutThisPlugin: Site[];
};

const getPluginInstallErrorCode = ( source: any ): string | undefined =>
	source?.code ||
	source?.data?.code ||
	source?.error ||
	source?.body?.error ||
	source?.body?.data?.code;

const handlePluginAlreadyInstalled = ( {
	displayPluginName,
	siteLabel,
	createSuccessNotice,
	closeModal,
}: {
	displayPluginName: string;
	siteLabel: string;
	createSuccessNotice: ( message: string, options?: { type: string } ) => void;
	closeModal?: () => void;
} ) => {
	invalidatePlugins();

	const installingMessage = sprintf(
		// translators: 1: plugin name, 2: site name.
		__( '%1$s is installing on %2$s. This may take a little while.' ),
		displayPluginName,
		siteLabel
	);
	createSuccessNotice( installingMessage, {
		type: 'snackbar',
	} );
	closeModal?.();
};

export const SitesWithoutThisPlugin = ( {
	pluginSlug,
	pluginName,
	isLoading,
	sitesWithoutThisPlugin,
}: SitesWithoutThisPluginProps ) => {
	const isMediumViewport = useViewportMatch( 'medium' );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ view, setView ] = useState< View >( defaultView );

	const fields: Field< Site >[] = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				getValue: ( { item }: { item: Site } ) => getSiteDisplayName( item ),
				render: ( { field, item } ) => (
					<PluginSiteFieldContent
						site={ item }
						name={ field.getValue( { item } ) as string }
						url={ getSiteDisplayUrl( item ) }
					/>
				),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'plan',
				label: __( 'Plan' ),
				getValue: ( { item }: { item: Site } ) => getSitePlanDisplayName( item ) ?? '',
				render: ( { field, item } ) => (
					<Plan
						// Match behaviour of the main sites DataView plan field
						nag={ item.plan?.expired ? { isExpired: true, site: item } : { isExpired: false } }
						isSelfHostedJetpackConnected={ isSelfHostedJetpackConnected( item ) }
						isJetpack={ item.jetpack }
						value={ field.getValue( { item } ) }
					/>
				),
				enableSorting: true,
				sort: ( a, b, direction ) => {
					const planA = getSitePlanDisplayName( a ) ?? '';
					const planB = getSitePlanDisplayName( b ) ?? '';

					return direction === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
				},
			},
		],
		[]
	);

	const actions: Action< Site >[] = useMemo(
		() => [
			{
				id: 'install-plugin',
				label: __( 'Install plugin' ),
				isPrimary: isMediumViewport,
				modalHeader: __( 'Install plugin' ),
				RenderModal: ( { items, closeModal } ) => {
					const { mutateAsync: installPluginMutate, isPending: isInstalling } = useMutation(
						installPluginMutation()
					);
					const site = items[ 0 ];
					const siteName = getSiteDisplayName( site );
					const siteUrl = getSiteDisplayUrl( site );
					const siteLabel = `${ siteName } (${ siteUrl })`;
					const displayPluginName = pluginName || pluginSlug;

					const handleConfirm = () => {
						if ( isInstalling ) {
							return;
						}

						installPluginMutate( { siteId: site.ID, slug: pluginSlug } )
							.then( ( response: any ) => {
								// In some cases the API can return HTTP 200 with an error code
								// in the response body (e.g., plugin_already_installed). Detect
								// that case here and treat it like the error path below.
								const responseErrorCode = getPluginInstallErrorCode( response );

								if ( responseErrorCode === 'plugin_already_installed' ) {
									handlePluginAlreadyInstalled( {
										displayPluginName,
										siteLabel,
										createSuccessNotice,
										closeModal,
									} );
									return;
								}

								const successMessage = sprintf(
									// translators: 1: plugin name, 2: site name.
									__( '%1$s was installed successfully on %2$s.' ),
									displayPluginName,
									siteLabel
								);
								createSuccessNotice( successMessage, {
									type: 'snackbar',
								} );
								closeModal?.();

								// Invalidate the cache once more to trigger a delayed check to avoid inconsistent states.
								setTimeout( () => invalidatePlugins(), 2000 );
							} )
							.catch( ( error: any ) => {
								const errorCode = getPluginInstallErrorCode( error );

								if ( errorCode === 'plugin_already_installed' ) {
									// The backend reports the plugin as already installed.
									// Invalidate the plugins cache and let the user know
									// that the installation is in progress.
									handlePluginAlreadyInstalled( {
										displayPluginName,
										siteLabel,
										createSuccessNotice,
										closeModal,
									} );
									return;
								}

								const errorMessage = sprintf(
									// translators: 1: plugin name, 2: site name.
									__( 'There was a problem installing %1$s on %2$s. Please try again.' ),
									displayPluginName,
									siteLabel
								);
								createErrorNotice( errorMessage, {
									type: 'snackbar',
								} );
							} );
					};

					return (
						<VStack spacing={ 4 }>
							<Text>
								{ sprintf(
									// translators: 1: plugin name, 2: site name.
									__( 'You are about to install %1$s on %2$s. Do you want to continue?' ),
									displayPluginName,
									siteLabel
								) }
							</Text>
							<HStack spacing={ 2 } justify="right">
								<Button
									variant="tertiary"
									onClick={ () => closeModal?.() }
									isBusy={ isInstalling }
									disabled={ isInstalling }
								>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									variant="primary"
									onClick={ handleConfirm }
									isBusy={ isInstalling }
									disabled={ isInstalling }
								>
									{ __( 'Install plugin' ) }
								</Button>
							</HStack>
						</VStack>
					);
				},
				supportsBulk: false,
				isEligible: ( item: Site ) => hasPlanFeature( item, DotcomFeatures.INSTALL_PLUGINS ),
			},
			{
				id: 'upgrade-to-install',
				label: __( 'Upgrade to install' ),
				isPrimary: isMediumViewport,
				callback: ( items: Site[] ) => {
					const site = items[ 0 ];

					if ( ! site ) {
						return;
					}

					if ( site.slug ) {
						window.open( `https://wordpress.com/plans/${ site.slug }`, '_blank' );
					}
				},
				isEligible: ( item: Site ) => ! hasPlanFeature( item, DotcomFeatures.INSTALL_PLUGINS ),
			},
			{
				id: 'wp-admin',
				label: __( 'WP Admin ↗' ),
				callback: ( items: Site[] ) => {
					const [ site ] = items;

					if ( ! site?.URL ) {
						return;
					}

					const baseUrl = site.URL.replace( /\/$/, '' );
					window.open( `${ baseUrl }/wp-admin/plugins.php`, '_blank' );
				},
				isEligible: ( item: Site ) => !! item.URL,
				supportsBulk: false,
				isPrimary: isMediumViewport,
			},
		],
		[ createErrorNotice, createSuccessNotice, isMediumViewport, pluginName, pluginSlug ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithoutThisPlugin, view, fields );

	return (
		<DataViews
			isLoading={ isLoading }
			data={ data }
			fields={ fields }
			actions={ actions }
			view={ view }
			onChangeView={ setView }
			defaultLayouts={ { table: {} } }
			getItemId={ ( item ) => String( item.ID ) }
			paginationInfo={ paginationInfo }
		/>
	);
};
