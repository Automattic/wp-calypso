/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { bindActionCreators } from 'redux';
import { map, reduce, merge, isFunction, omit } from 'lodash';

export readerFeed from './reader-feed';
export readerSite from './reader-site';
export readerTags from './reader-tags';

/**
 * A need represents a component's data needs. Its core is two different functions, mapStateToProps
 * and mapStateToRequestAction.
 *
 * mapStateToProps: given redux state, return all the data needed by children
 * mapStateToRequestActions: given redux state, return all of the actions needed to
 *                           be dispatched in order to fetch needed data
 * @typedef {Object} Need
 * @property {func} mapStateToProps
 * @property {func} mapStateToRequestAction
 */

const mergeMapPropsToRequestActions = ( needs, state, ownProps ) =>
	reduce(
		needs.mapStateToRequestActions,
		( accum, mapStateToRequestActions ) => [
			...accum,
			mapStateToRequestActions( state, ownProps ),
		],
		[]
	);

const mergeMapStateToProps = ( needs, state, ownProps ) =>
	reduce(
		map( needs, 'mapStateToProps' ),
		( accum, mapStateToProps ) => merge( accum, mapStateToProps( state, ownProps ) ),
		{}
	);

export default ( needs, mapDispatchToProps ) => Component => {
	class EnhancedComponent extends React.Component {
		static displayName = `Needs(${ Component.displayName })`;

		componentWillMount() {
			this.makeRequests( this.props.requestActions );
		}

		componentWillReceiveProps( nextProps ) {
			this.makeRequests( nextProps.requestActions );
		}

		makeRequests = ( requestActions = [] ) => {
			requestActions.forEach( action => this.props.dispatch( action ) );
		};

		render() {
			return <Component { ...omit( this.props, 'dispatch' ) } />;
		}
	}

	return connect(
		( state, ownProps ) => ( {
			requestActions: mergeMapPropsToRequestActions( needs, state, ownProps ),
			...mergeMapStateToProps( needs, state, ownProps ),
		} ),
		( dispatch, ownProps ) => {
			const props = { dispatch };

			if ( ! mapDispatchToProps ) {
				return props;
			}

			return isFunction( mapDispatchToProps )
				? Object.assign( props, mapDispatchToProps( dispatch, ownProps ) )
				: Object.assign( props, bindActionCreators( mapDispatchToProps, dispatch ) );
		}
	)( EnhancedComponent );
};
