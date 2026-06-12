import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import useActivityLogActorsQuery from 'calypso/data/activity-log/use-activity-log-actors-query';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TypeSelector } from './type-selector/type-selector';

const ActorSelector = ( { translate, variant = 'default', ...otherProps } ) => {
	return (
		<TypeSelector
			{ ...otherProps }
			title={ translate( 'Performed by' ) }
			typeKey="actor"
			showAppliedFiltersCount
			variant={ variant }
			translate={ translate }
		/>
	);
};

const withActors = ( WrappedComponent ) => {
	const WithActors = ( props ) => {
		const { siteId, filter } = props;
		const { data } = useActivityLogActorsQuery( siteId, filter );
		return <WrappedComponent { ...props } types={ data ?? [] } />;
	};
	WithActors.displayName = `withActors(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;
	return WithActors;
};

// `actor` values are opaque synthetic ids (e.g. `wpcom:123`, `mcp:cursor`).
// `actor_kinds` is derived as the distinct set of id prefixes so analytics
// can compare MCP-vs-wpcom usage without leaking the underlying ids.
const getActorKinds = ( actors ) =>
	Array.from(
		new Set(
			actors
				.map( ( id ) => {
					const idx = id.indexOf( ':' );
					return idx > 0 ? id.slice( 0, idx ) : '';
				} )
				.filter( Boolean )
		)
	)
		.sort()
		.join( ',' );

const selectActor = ( siteId, actors, allActors ) => ( dispatch ) => {
	const eventProps = {
		actor_count: actors.length,
		actor_kinds: getActorKinds( actors ),
		num_actors_available: allActors.length,
	};

	if ( 0 === actors.length ) {
		return dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_actor_filter_changed', eventProps ),
				updateFilter( siteId, { actor: null, page: 1 } )
			)
		);
	}

	return dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_activitylog_actor_filter_changed', eventProps ),
			updateFilter( siteId, { actor: actors, page: 1 } )
		)
	);
};

export default withActors(
	connect(
		( state ) => ( {
			siteId: getSelectedSiteId( state ),
		} ),
		{ selectActor },
		( stateProps, dispatchProps, ownProps ) => {
			const { types } = ownProps;
			const { siteId } = stateProps;

			return {
				...ownProps,
				...stateProps,
				selectType: ( selectedActors ) =>
					dispatchProps.selectActor( siteId, selectedActors, types ),
			};
		}
	)( localize( ActorSelector ) )
);
