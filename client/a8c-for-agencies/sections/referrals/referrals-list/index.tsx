import { Button, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, ReactNode } from 'react';
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
						{
							id: 'client',
							header: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return (
									<Button onClick={ () => openSitePreviewPane( item ) } borderless>
										{ item.client_email }
									</Button>
								);
							},
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [
						{
							id: 'client',
							header: translate( 'Client' ).toUpperCase(),
							getValue: () => '-',
							render: ( { item }: { item: Referral } ): ReactNode => {
								return item.client_email;
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
										<Button onClick={ () => openSitePreviewPane( item ) } borderless>
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

	return (
		<div className="redesigned-a8c-table">
			<ItemsDataViews
				data={ {
					items: referrals,
					getItemId: ( item: Referral ) => `${ item.client_id }`,
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
