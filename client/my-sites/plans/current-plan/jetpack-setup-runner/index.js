/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DoPluginSetup from './do-plugin-setup';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import { getSelectedSiteId } from 'state/ui/selectors';

const debug = debugFactory( 'calypso:plugin-setup' ); // eslint-disable-line no-unused-vars

class JetpackSetupRunner extends PureComponent {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		requiredPlugins: PropTypes.arrayOf( PropTypes.string ).isRequired,
		notifyProgress: PropTypes.func,
	};

	/**
	 * Handle progress updates and notify parent of progress
	 *
	 * In addition to install and activation, handled by DoPluginSetup, this component will
	 * provision plugin keys provided by a plan.
	 *
	 * Adjust progress accordingly.
	 */
	handleUpdateProgress = stateUpdate => {
		if ( 'function' === typeof this.props.notifyProgress ) {
			this.props.notifyProgress( {
				...stateUpdate,
				total: stateUpdate.total + 2, // Add two tasks for key provisioning
			} );
		}
	};

	render() {
		const { siteId } = this.props;
		return (
			<>
				{ siteId && <QueryPluginKeys siteId={ siteId } /> }
				<DoPluginSetup
					notifyProgress={ this.handleUpdateProgress }
					requiredPlugins={ [ 'akismet', 'vaultpress' ] }
				/>
			</>
		);
	}
}

export default connect( state => ( { siteId: getSelectedSiteId( state ) } ) )( JetpackSetupRunner );
