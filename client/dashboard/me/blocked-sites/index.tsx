import { blockedSitesInfiniteQuery, unblockSiteMutation } from '@automattic/api-queries';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { ExternalLink, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import { DataViewsEmptyState } from '../../components/dataviews-empty-state';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { BlockedSite } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;

const DEFAULT_VIEW: View = {
	type: 'table',
	descriptionField: 'URL',
	titleField: 'name',
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	infiniteScrollEnabled: true,
};

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
	const rafIdRef = useRef< number | null >( null );
	const ref = useRef< HTMLDivElement >( null );
	const dataviewsRef = useRef< HTMLDivElement | null >( null );
	const unblockSite = useMutation( unblockSiteMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
		blockedSitesInfiniteQuery( DEFAULT_PER_PAGE )
	);

	const sites = ( data?.pages || [] ).flat();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const infiniteScrollHandler = useCallback( () => {
		if ( hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, fetchNextPage ] );

	const handleResize = useCallback( () => {
		if ( ! dataviewsRef.current ) {
			return;
		}

		if ( rafIdRef.current ) {
			cancelAnimationFrame( rafIdRef.current );
		}

		rafIdRef.current = requestAnimationFrame( () => {
			if ( ! dataviewsRef.current ) {
				return;
			}

			const { top } = dataviewsRef.current.getBoundingClientRect();
			const maxHeight = window.innerHeight - top - 32 - 1;
			dataviewsRef.current.style.maxHeight = `${ maxHeight }px`;
		} );
	}, [] );

	useEffect( () => {
		setView( ( currentView ) => ( { ...currentView, perPage: sites.length } ) );
	}, [ sites.length ] );

	useLayoutEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		dataviewsRef.current = ref.current.querySelector< HTMLDivElement >( '.dataviews-wrapper' );
		if ( ! dataviewsRef.current ) {
			return;
		}

		handleResize();
		window.addEventListener( 'resize', handleResize );
		window.addEventListener( 'orientationchange', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
			window.removeEventListener( 'orientationchange', handleResize );

			if ( rafIdRef.current ) {
				cancelAnimationFrame( rafIdRef.current );
			}
		};
	}, [ handleResize ] );

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
			<DataViewsCard ref={ ref }>
				<DataViews< BlockedSite >
					data={ filteredData }
					fields={ fields }
					view={ view }
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
					paginationInfo={ {
						...paginationInfo,
						infiniteScrollHandler,
					} }
					empty={
						<DataViewsEmptyState
							title=""
							description={ __( 'You haven’t blocked any sites yet.' ) }
							mutedDescription={ false }
						/>
					}
					isLoading={ isLoading }
					onChangeView={ setView }
				>
					<>
						<DataViews.Layout />
					</>
				</DataViews>
			</DataViewsCard>
		</PageLayout>
	);
}
