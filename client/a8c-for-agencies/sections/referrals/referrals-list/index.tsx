import { Button, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, ReactNode, useEffect } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SubscriptionStatus from './subscription-status';
import type { Referral } from '../types';

interface Props {
	referrals: Referral[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
}

export default function ReferralList( { referrals, dataViewsState, setDataViewsState }: Props ) {
	const isDesktop = useDesktopBreakpoint();
	const translate = useTranslate();

	const openSitePreviewPane = useCallback(
		( referral: Referral ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: referral,
				type: DATAVIEWS_LIST,
			} ) );
		},
		[ setDataViewsState ]
	);

	const fields = useMemo(
		() =>
			dataViewsState.selectedItem || ! isDesktop
				? [
						// Show the client column as a button on mobile
						{
							id: 'client',
							header: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return (
									<Button
										className="view-details-button"
										data-client-id={ item.client.id }
										onClick={ () => openSitePreviewPane( item ) }
										borderless
									>
										{ item.client.email }
									</Button>
								);
							},
							width: '100%',
							enableHiding: false,
							enableSorting: false,
						},
						// Only show the actions column only on mobile
						...( ! dataViewsState.selectedItem
							? [
									{
										id: 'actions',
										header: null,
										render: ( { item }: { item: Referral } ) => {
											return (
												<div>
													<Button
														className="view-details-button"
														onClick={ () => openSitePreviewPane( item ) }
														borderless
													>
														<Gridicon icon="chevron-right" />
													</Button>
												</div>
											);
										},
										enableHiding: false,
										enableSorting: false,
									},
							  ]
							: [] ),
				  ]
				: [
						{
							id: 'client',
							header: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return item.client.email;
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'purchases',
							header: translate( 'Purchases' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return item.purchases.length;
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'pending-orders',
							header: translate( 'Pending Orders' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return item.statuses.filter( ( status ) => status === 'pending' ).length;
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'subscription-status',
							header: translate( 'Subscription Status' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => (
								<SubscriptionStatus item={ item } />
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'actions',
							header: translate( 'Actions' ).toUpperCase(),
							render: ( { item }: { item: Referral } ) => {
								return (
									<div>
										<Button
											className="view-details-button action-button"
											onClick={ () => openSitePreviewPane( item ) }
											borderless
										>
											<Gridicon icon="chevron-right" />
										</Button>
									</div>
								);
							},
							enableHiding: false,
							enableSorting: false,
						},
				  ],
		[ dataViewsState.selectedItem, isDesktop, openSitePreviewPane, translate ]
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

	return (
		<div className="redesigned-a8c-table">
			<ItemsDataViews
				data={ {
					items: referrals,
					getItemId: ( item: Referral ) => `${ item.client.id }`,
					onSelectionChange: ( data ) => {
						openSitePreviewPane( data[ 0 ] );
					},
					pagination: {
						totalItems: 1,
						totalPages: 1,
					},
					enableSearch: false,
					fields: fields,
					actions: [],
					setDataViewsState: setDataViewsState,
					dataViewsState: dataViewsState,
				} }
			/>
		</div>
	);
}
