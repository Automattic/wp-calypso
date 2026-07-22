import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, ReactNode, useState } from 'react';
import RequestReviewModal from '../request-review-modal';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import UntagSiteDialog from './untag-site-dialog';
import useCommissionListActions from './use-commission-list-actions';
import type { Field, View } from '@wordpress/dataviews';
import type {
	RecordTracksEvent,
	ShowSuccessNotice,
	TaggedSite,
} from 'calypso/dashboard/agency/earn/migrations/types';

import '../commissions/components/dataviews/style.scss';

type ActiveModal =
	| { kind: 'untag'; site: TaggedSite }
	| { kind: 'request-review'; site: TaggedSite }
	| null;

// `type`/`layout` are the only viewport-dependent parts of the view: a table on
// desktop, stacked list cards on narrow viewports.
function responsiveViewParts( isDesktop: boolean ): Pick< View, 'type' | 'layout' > {
	if ( ! isDesktop ) {
		return { type: 'list', layout: {} };
	}

	return {
		type: 'table',
		layout: {
			styles: {
				site: { width: '40%' },
				migratedOn: { width: '25%' },
				reviewStatus: { width: '25%' },
			},
		},
	};
}

// The stable, user-mutable parts of the view. `type`/`layout` are viewport-derived
// and applied in `responsiveView`, so the placeholders here are always overridden.
const INITIAL_VIEW: View = {
	search: '',
	filters: [],
	page: 1,
	perPage: 50,
	sort: { field: '', direction: 'asc' },
	// `site` is the titleField (rendered as the primary column/title), so it
	// must not also appear in the visible fields or it renders twice.
	titleField: 'site',
	fields: [ 'migratedOn', 'reviewStatus' ],
	type: 'table',
	layout: {},
};

export default function MigrationsCommissionsList( {
	items,
	migrationTags,
	recordTracksEvent,
	onSuccess,
	onError,
}: {
	items: TaggedSite[];
	migrationTags: string[];
	recordTracksEvent: RecordTracksEvent;
	onSuccess: ShowSuccessNotice;
	onError: ( message: ReactNode ) => void;
} ) {
	const isDesktop = useDesktopBreakpoint();

	const [ view, setView ] = useState< View >( INITIAL_VIEW );

	// `type`/`layout` follow the viewport; derive them at render so we don't sync
	// derived state through an effect. User-driven view changes stay in `view`.
	const responsiveView: View = { ...view, ...responsiveViewParts( isDesktop ) };

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
				label: __( 'Site' ),
				getValue: () => '-',
				render: ( { item }: { item: TaggedSite } ): ReactNode => <SiteColumn site={ item.url } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'migratedOn',
				// FIXME: This should be "Migrated on" instead of "Date added"
				// We will change this when the MC tool is implemented and we have the migration date
				label: __( 'Date added' ),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <MigratedOnColumn migratedOn={ item.created_at } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'reviewStatus',
				label: __( 'Review status' ),
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
		[]
	);

	return (
		<>
			<div className="redesigned-a8c-table full-width">
				<DataViews
					data={ items }
					view={ responsiveView }
					onChangeView={ setView }
					fields={ fields }
					search={ false }
					actions={ actions }
					getItemId={ ( item ) => `${ item.id }` }
					paginationInfo={ pagination }
					defaultLayouts={ { table: {}, list: {} } }
				>
					{ isDesktop && (
						<HStack
							className="dataviews__view-actions"
							justify="end"
							style={ { paddingInline: '64px' } }
						>
							<DataViews.ViewConfig />
						</HStack>
					) }
					<DataViews.Layout />
					<DataViews.Footer />
				</DataViews>
			</div>

			{ activeModal?.kind === 'untag' && (
				<UntagSiteDialog
					site={ activeModal.site }
					migrationTags={ migrationTags }
					onClose={ closeModal }
					onSuccess={ onSuccess }
				/>
			) }

			{ activeModal?.kind === 'request-review' && (
				<RequestReviewModal
					site={ activeModal.site }
					onClose={ closeModal }
					recordTracksEvent={ recordTracksEvent }
					onSuccess={ onSuccess }
					onError={ onError }
				/>
			) }
		</>
	);
}
