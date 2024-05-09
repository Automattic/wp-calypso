import { useQuery } from '@tanstack/react-query';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import fromActivityTypeApi from 'calypso/state/data-layer/wpcom/sites/activity-types/from-api';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TypeSelector } from './type-selector';

const ActivityTypeSelector = ( { translate, variant = 'default', ...otherProps } ) => {
	return (
		<TypeSelector
			{ ...otherProps }
			title={ translate( 'Activity type' ) }
			showAppliedFiltersCount
			variant={ variant }
			translate={ translate }
		/>
	);
};

const activityCountsQueryKey = ( siteId, filter ) => [
	'activity-log-counts',
	siteId,
	filter.before ?? '',
	filter.after ?? '',
	filter.on ?? '',
];
const withActivityTypes = ( WrappedComponent ) => ( props ) => {
	const { siteId, filter } = props;
	const { data } = useQuery( {
		queryKey: activityCountsQueryKey( siteId, filter ),
		queryFn: () =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity/count/group`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( filter, false )
				)
				.then( fromActivityTypeApi ),
		enabled: !! siteId,
		staleTime: 10 * 1000,
	} );
	return <WrappedComponent { ...props } types={ data ?? [] } />;
};

const selectActionType = ( siteId, group, allTypes ) => ( dispatch ) => {
	if ( 0 === group.length ) {
		return dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_filterbar_reset_type' ),
				updateFilter( siteId, { group: null, page: 1 } )
			)
		);
	}
	const eventProps = { num_groups_selected: group.length };
	allTypes.forEach(
		( type ) => ( eventProps[ 'group_' + type.key ] = group.includes( type.key ) )
	);
	eventProps.num_total_activities_selected = allTypes.reduce( ( accumulator, type ) => {
		return group.includes( type.key ) ? accumulator + type.count : accumulator;
	}, 0 );

	return dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_activitylog_filterbar_select_type', eventProps ),
			updateFilter( siteId, { group: group, page: 1 } )
		)
	);
};

export default withActivityTypes(
	connect(
		( state ) => ( {
			siteId: getSelectedSiteId( state ),
		} ),
		{ selectActionType },
		( stateProps, dispatchProps, ownProps ) => {
			const { types } = ownProps;
			const { siteId } = stateProps;

			return {
				...ownProps,
				...stateProps,
				selectType: ( selectedTypes ) =>
					dispatchProps.selectActionType( siteId, selectedTypes, types ),
			};
		}
	)( localize( ActivityTypeSelector ) )
);
