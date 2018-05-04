/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getPluginsWithUpdates } from 'state/plugins/installed/selectors';

export default WrappedComponent => {
	class PluginsToUpdate extends Component {
		static propTypes = {
			siteId: PropTypes.number,

			// Connected
			plugins: PropTypes.arrayOf( PropTypes.object ),
		};

		state = {
			// Plugins already updated + those with pending updates
			plugins: [],
		};

		static getDerivedStateFromProps( nextProps, prevState ) {
			return { plugins: unionBy( nextProps.plugins, prevState.plugins, 'slug' ) };
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					siteId={ this.props.siteId }
					plugins={ this.state.plugins }
				/>
			);
		}
	}
	return connect( ( state, { siteId } ) => ( {
		plugins: getPluginsWithUpdates( state, [ siteId ] ),
	} ) )( PluginsToUpdate );
};
