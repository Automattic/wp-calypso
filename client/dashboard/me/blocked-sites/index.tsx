import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { blockedSitesQuery, unblockSiteMutation } from '../../app/queries/me-blocked-sites';
import DataViewsCard from '../../components/dataviews-card';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { BlockedSite } from '../../data/me-blocked-sites';
import type { Field } from '@wordpress/dataviews';

const getHostname = ( url: string ) => {
	try {
		return new URL( url ).hostname;
	} catch ( e ) {
		return url;
	}
};

const fields: Field< BlockedSite >[] = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableHiding: false,
		getValue: ( { item } ) => item.name,
	},
	{
		id: 'URL',
		getValue: ( { item } ) => item.URL,
		render: ( { item } ) => (
			<ExternalLink className="dataviews-url-field" href={ item.URL }>
				{ getHostname( item.URL ) }
			</ExternalLink>
		),
	},
];

export default function BlockedSites() {
	// TODO: Implement infinite scroll once DataViews is updated to support it.
	const { data: { sites, page } = { sites: [], page: 1 }, isLoading } = useQuery(
		blockedSitesQuery()
	);
	const unblockSite = useMutation( unblockSiteMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Blocked sites' ) }
					description={ createInterpolateElement(
						__(
							'Blocked sites will not appear in your Reader and will not be recommended to you. <link>Learn more</link>'
						),
						{
							link: (
								<InlineSupportLink
									supportPostId={ 32011 }
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									supportLink="https://wordpress.com/support/reader/#interact-with-posts"
								/>
							),
						}
					) }
				/>
			}
		>
			<DataViewsCard>
				<DataViews< BlockedSite >
					data={ sites }
					fields={ fields }
					view={ {
						type: 'table',
						descriptionField: 'URL',
						titleField: 'name',
					} }
					actions={ [
						{
							id: 'unblock',
							label: __( 'Unblock' ),
							icon: <Icon icon={ closeSmall } />,
							isPrimary: true,
							disabled: unblockSite.isPending,
							callback: ( items: BlockedSite[] ) => {
								const item = items[ 0 ];
								unblockSite.mutate( item.ID, {
									onSuccess: () => {
										createSuccessNotice(
											sprintf(
												/* translators: %s - the name of the unblocked site */
												__( '%s was unblocked.' ),
												item.name
											),
											{
												type: 'snackbar',
											}
										);
									},
									onError: () => {
										createErrorNotice(
											sprintf(
												/* translators: %s - the name of the unblocked site */
												__( 'Failed to unblock %s.' ),
												item.name
											),
											{
												type: 'snackbar',
											}
										);
									},
								} );
							},
						},
					] }
					getItemId={ ( item ) => item.ID.toString() }
					defaultLayouts={ { table: {} } }
					paginationInfo={ { totalItems: sites.length, totalPages: page } }
					empty={ __( 'You haven’t blocked any sites yet.' ) }
					isLoading={ isLoading }
					onChangeView={ () => {} }
				>
					<>
						<DataViews.Layout />
					</>
				</DataViews>
			</DataViewsCard>
		</PageLayout>
	);
}
