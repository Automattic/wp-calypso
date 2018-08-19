/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getPluginKey from 'state/selectors/get-plugin-key';
import PluginsStore from 'lib/plugins/store';
import QueryPluginKeys from 'components/data/query-plugin-keys';

const debug = debugFactory( 'calypso:jetpack:plan-setup-runner' );

class JetpackPlanSetupRunner extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		akismetKey: PropTypes.string,
		vaultpressKey: PropTypes.string,
	};

	state = {};

	componentDidMount() {
		PluginsStore.on( 'change', this.updateState );
		PluginsStore.fetchSitePlugins();
	}

	componentWillUnmount() {
		PluginsStore.off( 'change', this.updateState );
	}

	updateState = () => {
		const s = {
			akismet: PluginsStore.getSitePlugin( this.props.site, 'akismet' ),
			vaultpress: PluginsStore.getSitePlugin( this.props.site, 'vaultpress' ),
		};
		debug( 'Plugins: %o', s );
		this.setState( s );
	};

	render() {
		const { site, ...props } = this.props;
		return (
			<>
				<QueryPluginKeys siteId={ this.props.site.ID } />
				<pre>{ JSON.stringify( props, undefined, 2 ) }</pre>
				<pre>{ JSON.stringify( this.state, undefined, 2 ) }</pre>
			</>
		);
	}
}

export default connect( ( state, { site } ) => ( {
	akismetKey: getPluginKey( state, site.ID, 'akismet' ),
	vaultpressKey: getPluginKey( state, site.ID, 'vaultpress' ),
} ) )( JetpackPlanSetupRunner );
