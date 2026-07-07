import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import RequestReviewModal from '../request-review-modal';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import MigrationsCommissionsListMobileView from './mobile-view';
import UntagSiteDialog from './untag-site-dialog';
import useCommissionListActions from './use-commission-list-actions';
import type { TaggedSite } from '../types';
import type { Field } from '@wordpress/dataviews';

type ActiveModal =
	| { kind: 'untag'; site: TaggedSite }
	| { kind: 'request-review'; site: TaggedSite }
	| null;

export default function MigrationsCommissionsList( {
	items,
	migrationTags,
}: {
	items: TaggedSite[];
	migrationTags: string[];
} ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'migratedOn', 'reviewStatus' ],
		layout: {
			styles: {
				site: { width: '40%' },
				migratedOn: { width: '25%' },
				reviewStatus: { width: '25%' },
			},
		},
	} );

	const [ activeModal, setActiveModal ] = useState< ActiveModal >( null );

	const closeModal = useCallback( () => setActiveModal( null ), [] );

	const onUntagSite = useCallback(
		( site: TaggedSite ) => setActiveModal( { kind: 'untag', site } ),
		[]
	);

	const onRequestReview = useCallback(
		( site: TaggedSite ) => setActiveModal( { kind: 'request-review', site } ),
		[]
	);

	const actions = useCommissionListActions( { onUntagSite, onRequestReview } );

	const pagination = {
		totalItems: items.length,
		totalPages: 1,
	};

	const fields: Field< TaggedSite >[] = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TaggedSite } ): ReactNode => <SiteColumn site={ item.url } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'migratedOn',
				// FIXME: This should be "Migrated on" instead of "Date added"
				// We will change this when the MC tool is implemented and we have the migration date
				label: translate( 'Date added' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <MigratedOnColumn migratedOn={ item.created_at } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'reviewStatus',
				label: translate( 'Review status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TaggedSite } ): ReactNode => {
					return (
						<ReviewStatusColumn
							reviewStatus={ item.incentive_status }
							rejectionReason={ item.incentive_rejection_reason }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	return (
		<>
			{ isDesktop ? (
				<div className="redesigned-a8c-table full-width">
					<ItemsDataViews
						data={ {
							items,
							getItemId: ( item ) => `${ item.id }`,
							pagination,
							enableSearch: false,
							fields,
							actions,
							setDataViewsState,
							dataViewsState,
							defaultLayouts: { table: {} },
						} }
					>
						<HStack
							className="dataviews__view-actions"
							justify="end"
							style={ { paddingInline: '64px' } }
						>
							<DataViews.ViewConfig />
						</HStack>
						<DataViews.Layout />
						<DataViews.Footer />
					</ItemsDataViews>
				</div>
			) : (
				<MigrationsCommissionsListMobileView commissions={ items } actions={ actions } />
			) }

			{ activeModal?.kind === 'untag' && (
				<UntagSiteDialog
					site={ activeModal.site }
					migrationTags={ migrationTags }
					onClose={ closeModal }
				/>
			) }

			{ activeModal?.kind === 'request-review' && (
				<RequestReviewModal site={ activeModal.site } onClose={ closeModal } />
			) }
		</>
	);
}
