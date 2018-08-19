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

/* eslint-disable no-unused-vars,no-shadow */

const debug = debugFactory( 'calypso:jetpack:plan-setup-runner' );

const slug = 'vaultpress';

class JetpackPlanSetupRunner extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		akismetKey: PropTypes.string,
		vaultpressKey: PropTypes.string,
	};

	static pluginSetupSlugs = [ /*'akismet',*/ 'vaultpress' ];

	// static pluginSlugObjectBuilder( reducer, initialObject = {} ) {
	// 	return JetpackPlanSetupRunner.pluginSetupSlugs.reduce( reducer, initialObject );
	// }

	state = {};

	componentDidMount() {
		PluginsStore.on( 'change', this.updateState );

		// Kick off fetching
		PluginsStore.getSitePlugins( this.props.site );
	}

	componentWillUnmount() {
		PluginsStore.off( 'change', this.updateState );
	}

	updateState = this.setSate( this.nextState );

	nextState = ( prevState = {} ) => {
		return {
			[ slug ]: ( slug => {
				return PluginsStore.getSitePlugin( this.props.site, slug );
			} )( slug ),
		};
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
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	keys: JetpackPlanSetupRunner.pluginSlugObjectBuilder( ( acc, slug ) => ( {
		...acc,
		[ slug ]: getPluginKey( state, site.ID, slug ),
	} ) ),
} ) )( JetpackPlanSetupRunner );
