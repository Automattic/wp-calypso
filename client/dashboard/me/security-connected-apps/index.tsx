import {
	connectedApplicationsQuery,
	deleteConnectedApplicationMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import useIntlCollator from '../../app/hooks/use-intl-collator';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard } from '../../components/dataviews-card';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';
import ApplicationDetailsModal from './application-details-modal';
import type { ConnectedApplication } from '@automattic/api-core';

export default function SecurityConnectedApps() {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: connectedApplications, isLoading } = useSuspenseQuery(
		connectedApplicationsQuery()
	);

	const intlCollator = useIntlCollator();

	const [ selectedApplicationToRemove, setSelectedApplicationToRemove ] =
		useState< ConnectedApplication | null >( null );
	const [ selectedApplicationToView, setSelectedApplicationToView ] =
		useState< ConnectedApplication | null >( null );

	const { mutate: deleteConnectedApplication, isPending: isDeletingConnectedApplication } =
		useMutation( deleteConnectedApplicationMutation() );

	const handleDisconnect = () => {
		if ( selectedApplicationToRemove ) {
			recordTracksEvent( 'calypso_dashboard_security_connected_apps_remove_click' );
			deleteConnectedApplication( selectedApplicationToRemove.ID, {
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is the name of the application */
							__( 'The application %s no longer has access to your WordPress.com account.' ),
							selectedApplicationToRemove.title
						),
						{
							type: 'snackbar',
						}
					);
				},
				onError: () => {
					createErrorNotice( __( 'Failed to disconnect application.' ), {
						type: 'snackbar',
					} );
				},
				onSettled: () => {
					setSelectedApplicationToRemove( null );
				},
			} );
		}
	};

	const totalItems = connectedApplications.length;

	// Sort applications alphabetically by title using the intlCollator
	const sortedConnectedApplications = connectedApplications.sort( ( a, b ) => {
		return intlCollator.compare( a.title, b.title );
	} );

	const fields =
		totalItems > 0
			? [
					{
						id: 'application',
						label: __( 'Application' ),
						getValue: ( { item }: { item: ConnectedApplication } ) => item.title,
					},
					{
						id: 'icon',
						render: ( { item }: { item: ConnectedApplication } ) => (
							<img
								className="icon"
								src={ item.icon }
								alt={ item.title }
								loading="lazy"
								style={ { width: 32, height: 32 } }
							/>
						),
					},
			  ]
			: [];

	const view = {
		type: 'table' as const,
		showMedia: true,
		mediaField: 'icon',
		titleField: 'application',
		...( totalItems > 0 ? { fields: [ '' ] } : {} ),
	};

	const actions =
		totalItems > 0
			? [
					{
						id: 'disconnect',
						isPrimary: true,
						icon: <Icon icon={ trash } />,
						label: __( 'Disconnect' ),
						callback: ( items: ConnectedApplication[] ) => {
							const item = items[ 0 ];
							recordTracksEvent( 'calypso_dashboard_security_connected_apps_remove_dialog_open' );
							setSelectedApplicationToRemove( item );
						},
					},
					{
						id: 'view-details',
						label: __( 'View details' ),
						callback: ( items: ConnectedApplication[] ) => {
							const item = items[ 0 ];
							recordTracksEvent(
								'calypso_dashboard_security_connected_apps_view_details_modal_open'
							);
							setSelectedApplicationToView( item );
						},
					},
			  ]
			: [];

	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Connected applications' ) }
					description={ createInterpolateElement(
						__(
							'Connect with third-party applications that extend your site in new and cool ways. <link>Learn more</link>'
						),
						{
							link: (
								<InlineSupportLink
									supportPostId={ 17288 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/third-party-applications/'
									) }
								/>
							),
						}
					) }
				/>
			}
		>
			<DataViewsCard>
				<DataViews< ConnectedApplication >
					getItemId={ ( item ) => item.ID }
					data={ sortedConnectedApplications }
					fields={ totalItems > 0 ? fields : [] }
					actions={ actions }
					view={ view }
					isLoading={ isLoading }
					onChangeView={ () => {} }
					defaultLayouts={ { table: {} } }
					paginationInfo={ { totalItems, totalPages: 1 } }
					empty={
						<Text as="p" variant="muted" style={ { paddingBlock: '48px' } }>
							{ __( 'You haven’t connected any apps yet.' ) }
						</Text>
					}
				>
					<DataViews.Layout />
				</DataViews>
			</DataViewsCard>
			<ConfirmModal
				isOpen={ !! selectedApplicationToRemove }
				confirmButtonProps={ {
					label: __( 'Disconnect' ),
					isBusy: isDeletingConnectedApplication,
					disabled: isDeletingConnectedApplication,
				} }
				onCancel={ () => setSelectedApplicationToRemove( null ) }
				onConfirm={ handleDisconnect }
			>
				{ createInterpolateElement(
					/* translators: <applicationName /> is the name of the application */
					__( 'Are you sure you want to disconnect application <applicationName />?' ),
					{
						applicationName: <strong>{ selectedApplicationToRemove?.title }</strong>,
					}
				) }
			</ConfirmModal>
			{ selectedApplicationToView && (
				<ApplicationDetailsModal
					application={ selectedApplicationToView }
					onClose={ () => setSelectedApplicationToView( null ) }
				/>
			) }
		</PageLayout>
	);
}
