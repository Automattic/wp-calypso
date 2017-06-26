/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import debugFactor from 'debug';
import { find, isEqual } from 'lodash';
import { localize } from 'i18n-calypso';

const debug = debugFactor( 'woocommerce:action-list' );

/**
 * Internal dependencies
 */
import { activatePlugin, installPlugin } from 'state/plugins/installed/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';

const requiredPlugins = [
	'woocommerce',
	'wc-api-dev',
	'woocommerce-gateway-stripe',
	'woocommerce-services',
];

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		plugins: PropTypes.array,
	};

	componentDidMount = () => {
		const { plugins } = this.props;

		if ( plugins && plugins.length ) {
			this.installPlugins( plugins );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		if ( isEqual( newProps.plugins, this.props.plugins ) ) {
			return;
		}
		this.installPlugins( newProps.plugins );
	}

	installPlugins = ( plugins ) => {
		const { siteId, wporg } = this.props;
		requiredPlugins.map( function( slug ) {
			const plugin = find( plugins, { slug } );
			if ( slug === 'wc-api-dev' ) {
				debug( 'wc-api-dev not installed since it is on on WordPress.org' );
			}
			if ( ! plugin ) {
				const wporgPlugin = getPlugin( wporg, slug );
				// debugger;
				installPlugin( siteId, wporgPlugin );
				return;
			}
			if ( plugin && ! plugin.active ) {
				// debugger;
				activatePlugin( siteId, plugin );
			}
		} );
	}

	render = () => {
		const { translate, siteId, plugins } = this.props;
		return (
			<div className="card dashboard__setup-wrapper">
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Setting up your store' ) }
					subtitle={ translate( 'Give us a minute and we\'ll move right along.' ) }
				>
					<ProgressBar value={ 75 } isPulsing />
					<ul>
					{ plugins.map( ( plugin ) => (
						<li>{ plugin.name } ({ plugin.active ? 'active' : 'inactive' })</li>
					) ) }
					</ul>
				</SetupHeader>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const siteId = selectedSite && selectedSite.ID;

	return {
		siteId,
		plugins: getPlugins( state, [ { ID: siteId } ] ),
		wporg: state.plugins.wporg.items,
	};
}

export default connect( mapStateToProps )( localize( RequiredPluginsInstallView ) );
