import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, ReactNode, useEffect } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import CommissionsColumn from './commissions-column';
import SubscriptionStatus from './subscription-status';
import type { Referral } from '../types';
import type { Field, Action } from '@wordpress/dataviews';

import './style.scss';

interface Props {
	referrals: Referral[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
}

export default function ReferralList( { referrals, dataViewsState, setDataViewsState }: Props ) {
	const isDesktop = useDesktopBreakpoint();
	const translate = useTranslate();
	const dispatch = useDispatch();

	const openSitePreviewPane = useCallback(
		( referral: Referral ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: referral,
				type: DATAVIEWS_LIST,
			} ) );
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_list_view_details_click' ) );
		},
		[ dispatch, setDataViewsState ]
	);

	const fields: Field< any >[] = useMemo(
		() =>
			dataViewsState.selectedItem || ! isDesktop
				? [
						{
							id: 'client',
							label: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<span className="a4a-referrals-client">{ item.client.email }</span>
							),
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [
						{
							id: 'client',
							label: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<span className="a4a-referrals-client">{ item.client.email }</span>
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'completed-orders',
							label: translate( 'Purchases' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode =>
								item.referralStatuses.filter( ( status ) => status === 'active' ).length,
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'pending-orders',
							label: translate( 'Pending Orders' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode =>
								item.referralStatuses.filter( ( status ) => status === 'pending' ).length,
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'estimated-commissions',
							label: translate( 'Estimated Commissions' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<CommissionsColumn referral={ item } />
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'subscription-status',
							label: translate( 'Subscription Status' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<SubscriptionStatus item={ item } />
							),
							enableHiding: false,
							enableSorting: false,
						},
				  ],
		[ dataViewsState.selectedItem, isDesktop, translate ]
	);

	useEffect( () => {
		// If the user clicks on a row, open the preview pane by triggering the View details button click.
		const handleRowClick = ( event: Event ) => {
			const target = event.target as HTMLElement;
			const row = target.closest(
				'.dataviews-view-table__row, li:has(.dataviews-view-list__item)'
			);

			if ( row ) {
				const isButtonOrLink = target.closest( 'button, a' );
				if ( ! isButtonOrLink ) {
					const button = row.querySelector( '.view-details-button' ) as HTMLButtonElement;
					if ( button ) {
						button.click();
					}
				}
			}
		};

		const rowsContainer = document.querySelector( '.dataviews-view-table, .dataviews-view-list' );

		if ( rowsContainer ) {
			rowsContainer.addEventListener( 'click', handleRowClick as EventListener );
		}

		// We need to trigger the click event on the View details button when the selected item changes to ensure highlighted row is correct.
		if (
			rowsContainer?.classList.contains( 'dataviews-view-list' ) &&
			dataViewsState?.selectedItem?.client_id
		) {
			const trigger: HTMLButtonElement | null = rowsContainer.querySelector(
				`li:not(.is-selected) .view-details-button[data-client-id='${ dataViewsState?.selectedItem?.client_id }']`
			);
			if ( trigger ) {
				trigger.click();
			}
		}

		return () => {
			if ( rowsContainer ) {
				rowsContainer.removeEventListener( 'click', handleRowClick as EventListener );
			}
		};
	}, [ dataViewsState ] );

	const actions: Action< Referral >[] = useMemo( () => {
		if ( dataViewsState.type === 'table' ) {
			return [
				{
					id: 'view-details',
					label: translate( 'View Details' ),
					isPrimary: true,
					icon: chevronRight,
					callback( items ) {
						openSitePreviewPane( items[ 0 ] );
					},
				},
			];
		}

		return [];
	}, [ openSitePreviewPane, translate, dataViewsState.type ] );

	const { data: items, paginationInfo: pagination } = useMemo( () => {
		return filterSortAndPaginate( referrals, dataViewsState, fields );
	}, [ referrals, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item: Referral ) => `${ item.client.id }`,
					onSelectionChange: ( data ) => {
						const referral = referrals.find( ( r ) => r.client.id === +data[ 0 ] );
						if ( referral ) {
							openSitePreviewPane( referral );
						}
					},
					pagination,
					enableSearch: false,
					fields,
					actions,
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
