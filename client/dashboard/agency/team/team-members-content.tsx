import { __experimentalHStack as HStack } from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { useTeamFields } from './dataviews/fields';
import { DEFAULT_LAYOUTS } from './dataviews/views';
import type { TeamMember } from '@automattic/api-core';
import type { Action, View } from '@wordpress/dataviews';

import './style.scss';

export function getTeamMemberId( item: TeamMember ): string {
	return `${ item.status === 'active' ? 'member' : 'invite' }-${ item.id }`;
}

interface TeamMembersContentProps {
	members: TeamMember[];
	actions: Action< TeamMember >[];
	view: View;
	onChangeView: ( view: View ) => void;
	onReset?: () => void;
	isLoading?: boolean;
}

export default function TeamMembersContent( {
	members,
	actions,
	view,
	onChangeView,
	onReset,
	isLoading,
}: TeamMembersContentProps ) {
	const fields = useTeamFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( members, view, fields );

	return (
		<DataViewsCard>
			<DataViews< TeamMember >
				data={ filteredData }
				fields={ fields }
				view={ view }
				actions={ actions }
				onChangeView={ onChangeView }
				onReset={ onReset }
				isLoading={ isLoading }
				paginationInfo={ paginationInfo }
				getItemId={ getTeamMemberId }
				defaultLayouts={ DEFAULT_LAYOUTS }
				empty={
					<DataViewsEmptyStateLayout
						title={
							view.search ? __( 'No team members match your search' ) : __( 'No team members' )
						}
						description={
							view.search
								? __( 'Try a different search term.' )
								: __( 'Invite a team member to get started.' )
						}
					/>
				}
			>
				{ /* Padding mirrors the default `.dataviews__view-actions` so this custom
				   toolbar aligns with the table below it. Kept as free composition for
				   reuse in a8c-for-agencies.
				   TODO: remove after we sunset a8c-for-agencies. */ }
				<HStack
					alignment="top"
					justify="space-between"
					spacing={ 2 }
					style={ {
						boxSizing: 'border-box',
						padding:
							'var(--wpds-dimension-padding-lg, 16px) var(--wpds-dimension-padding-2xl, 24px)',
					} }
				>
					<HStack justify="flex-start" spacing={ 3 } expanded={ false }>
						<WPDataViews.Search />
						<WPDataViews.FiltersToggle />
					</HStack>
					<WPDataViews.ViewConfig />
				</HStack>
				<WPDataViews.FiltersToggled className="dataviews-filters__container" />
				<WPDataViews.Layout />
				<WPDataViews.Footer />
			</DataViews>
		</DataViewsCard>
	);
}
