/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, unionBy, extend } from 'lodash';

/**
 * Internal dependencies
 */
import { getPluginsWithUpdates } from 'state/plugins/installed/selectors';
import { requestHttpData, getHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

const getThemesWithUpdates = siteId =>
	requestHttpData(
		`theme-update-${ siteId }-data`,
		http( {
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ siteId }/alerts`,
		} ),
		{ fromApi: () => ( { updates: { themes: { id } } } ) => [ [ id, true ] ] }
	);

const themesWithUpdates = siteId =>
	get( getHttpData( `theme-update-${ siteId }-data` ), 'data.updates.themes', [] );

const mapUpdateNewVersionToVersion = plugin =>
	extend( plugin, {
		version: plugin.update.new_version,
		type: 'plugin',
	} );

export default WrappedComponent => {
	class ToUpdate extends Component {
		static propTypes = {
			siteId: PropTypes.number,

			// Connected
			plugins: PropTypes.arrayOf( PropTypes.object ),
			themes: PropTypes.arrayOf( PropTypes.object ),
			getThemesWithUpdates: PropTypes.func,
		};

		state = {
			// Plugins already updated + those with pending updates
			plugins: [],
			siteId: this.props.siteId,
		};

		static getDerivedStateFromProps( nextProps, prevState ) {
			return {
				plugins:
					nextProps.siteId === prevState.siteId
						? unionBy( nextProps.plugins, prevState.plugins, 'slug' )
						: [],
				siteId: nextProps.siteId,
			};
		}

		componentDidMount() {
			this.props.getThemesWithUpdates();
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					siteId={ this.props.siteId }
					plugins={ this.state.plugins }
					themes={ this.props.themes }
				/>
			);
		}
	}
	return connect(
		( state, { siteId } ) => ( {
			plugins: getPluginsWithUpdates( state, [ siteId ] ).map( mapUpdateNewVersionToVersion ),
			themes: themesWithUpdates( siteId ),
		} ),
		( dispatch, { siteId } ) => ( {
			getThemesWithUpdates: () => getThemesWithUpdates( siteId ),
		} )
	)( ToUpdate );
};
