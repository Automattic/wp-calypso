import { __experimentalHStack as HStack } from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { DataViews, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { getReferralFields } from './dataviews/fields';
import { DEFAULT_LAYOUTS } from './dataviews/views';
import type { Referral } from '@automattic/api-core';
import type { Action, View } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

interface Props {
	referrals: Referral[];
	view: View;
	onChangeView: ( view: View ) => void;
	onReset?: () => void;
	isLoading?: boolean;
	renderClient?: ( item: Referral ) => ReactNode;
	actions?: Action< Referral >[];
	selection?: string[];
	onChangeSelection?: ( ids: string[] ) => void;
}

export default function ReferralsList( {
	referrals,
	view,
	onChangeView,
	onReset,
	isLoading,
	renderClient,
	actions,
	selection,
	onChangeSelection,
}: Props ) {
	const fields = getReferralFields( renderClient );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( referrals, view, fields );

	return (
		<DataViews< Referral >
			data={ filteredData }
			fields={ fields }
			actions={ actions }
			view={ view }
			onChangeView={ onChangeView }
			onReset={ onReset }
			isLoading={ isLoading }
			selection={ selection }
			onChangeSelection={ onChangeSelection }
			searchLabel={ __( 'Search by client email' ) }
			paginationInfo={ paginationInfo }
			getItemId={ ( item ) => String( item.id ) }
			defaultLayouts={ DEFAULT_LAYOUTS }
			empty={
				<DataViewsEmptyStateLayout
					title={ __( 'No referrals' ) }
					description={ __( 'Referrals from your clients will appear here.' ) }
					isBorderless
				/>
			}
		>
			{ /* The layout switcher is intentionally omitted: the layout is app-controlled. */ }
			<HStack
				className="dataviews__view-actions referrals-list__view-actions"
				justify="space-between"
				alignment="center"
			>
				<WPDataViews.Search />
				<WPDataViews.ViewConfig />
			</HStack>
			<WPDataViews.Layout />
			<WPDataViews.Footer />
		</DataViews>
	);
}
