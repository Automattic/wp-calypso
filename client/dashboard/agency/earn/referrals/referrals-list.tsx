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
	/**
	 * Renders the client cell. The host app injects navigation (MSD links to a
	 * detail route; A4A opens a preview pane).
	 */
	renderClient?: ( item: Referral ) => ReactNode;
	/**
	 * Row actions. The host app injects these (e.g. A4A adds a "View details"
	 * action that opens its preview pane).
	 */
	actions?: Action< Referral >[];
	/**
	 * Selected item ids. Drives the row highlight and makes rows clickable, which
	 * A4A uses to keep the list in sync with its preview pane.
	 */
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
				/>
			}
		>
			{ /* Free composition: the layout switcher is intentionally omitted so the
			   layout stays app-controlled (A4A switches to a list while its preview
			   pane is open) rather than user-switchable. */ }
			<HStack className="dataviews__view-actions" justify="space-between" alignment="center">
				<WPDataViews.Search />
				<WPDataViews.ViewConfig />
			</HStack>
			<WPDataViews.Layout />
			<WPDataViews.Footer />
		</DataViews>
	);
}
