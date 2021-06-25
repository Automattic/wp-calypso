/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPluginsWithUpdates } from 'calypso/state/plugins/installed/selectors';
import { isJetpackSiteSecondaryNetworkSite } from 'calypso/state/sites/selectors';
import { requestSiteAlerts } from 'calypso/state/data-getters';

const emptyList = [];

const unionBySlug = ( a = [], b = [] ) => [
	...a,
	...b.filter( ( be ) => ! a.some( ( ae ) => ae.slug === be.slug ) ),
];

export default ( WrappedComponent ) => {
	class ToUpdate extends Component {
		static propTypes = {
			siteId: PropTypes.number,

			// Connected
			plugins: PropTypes.arrayOf( PropTypes.object ),
			themes: PropTypes.arrayOf( PropTypes.object ),
			core: PropTypes.arrayOf( PropTypes.object ),
		};

		state = {
			// Plugins already updated + those with pending updates
			plugins: emptyList,
			siteId: this.props.siteId,
		};

		static getDerivedStateFromProps( nextProps, prevState ) {
			return {
				plugins:
					nextProps.siteId === prevState.siteId
						? unionBySlug( nextProps.plugins, prevState.plugins )
						: emptyList,
				siteId: nextProps.siteId,
			};
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					siteId={ this.props.siteId }
					plugins={ this.state.plugins }
					themes={ this.props.themes }
					core={ this.props.core }
				/>
			);
		}
	}
	return connect( ( state, { siteId } ) => {
		const alertsData = requestSiteAlerts( siteId );
		let pluginsWithUpdates = null;
		if ( ! isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
			pluginsWithUpdates = getPluginsWithUpdates( state, [ siteId ] );
		}
		return {
			plugins: pluginsWithUpdates,
			themes: get( alertsData, 'data.updates.themes', emptyList ),
			core: get( alertsData, 'data.updates.core', emptyList ),
		};
	} )( ToUpdate );
};
