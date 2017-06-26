/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import debugFactor from 'debug';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

const debug = debugFactor( 'woocommerce:action-list' );

/**
 * Internal dependencies
 */
import { activatePlugin, installPlugin } from 'state/plugins/installed/actions';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins, isRequesting } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';

const requiredPlugins = [
	'woocommerce',
	// 'wc-api-dev',
	'woocommerce-gateway-stripe',
	'woocommerce-services',
];

const requiredPluginIds = {
	woocommerce: 'woocommerce/woocommerce',
	// 'wc-api-dev': 'wc-api-dev/wc-api-dev',
	'woocommerce-gateway-stripe': 'woocommerce-gateway-stripe/woocommerce-gateway-stripe',
	'woocommerce-services': 'woocommerce-services/woocommerce-services',
};

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		plugins: PropTypes.array,
	};

	constructor( props ) {
		super( props );
		this.state = {
			installingPlugin: null,
			allPluginsInstalled: false,
		};
	}

	componentDidMount = () => {
		const { plugins } = this.props;

		if ( plugins && plugins.length && ! this.props.isRequesting ) {
			this.installPlugins( plugins );
		}

		this.getWporgPluginData();
	}

	componentDidUpdate = ( newProps ) => {
		if (
			( newProps.plugins && newProps.plugins.length && ! this.state.installingPlugin ) ||
			( find( newProps.plugins, { slug: this.state.installingPlugin } ) )
		) {
			this.installPlugins( newProps.plugins );
		}
	}

	getWporgPluginData() {
		requiredPlugins.map( plugin => {
			const pluginData = getPlugin( this.props.wporg, plugin );
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin );
			}
		} );
	}

	installPlugins = ( plugins ) => {
		const { siteId, wporg } = this.props;
		for ( let i = 0; i < requiredPlugins.length; i++ ) {
			const slug = requiredPlugins[ i ];
			const plugin = find( plugins, { slug } );
			if ( ! plugin ) {
				if ( ! wporg[ slug ] ) {
					return;
				}
				const wporgPlugin = getPlugin( wporg, slug );
				this.setState( { installingPlugin: slug } );
				debugger;
				this.props.installPlugin( siteId, { ...wporgPlugin, id: requiredPluginIds[ slug ] } );
				return;
			}
		}
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
						<li key={ plugin.slug }>{ plugin.name } ({ plugin.active ? 'active' : 'inactive' })</li>
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
		isRequesting: isRequesting( state, siteId ),
		siteId,
		plugins: getPlugins( state, [ { ID: siteId } ] ),
		wporg: state.plugins.wporg.items,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			activatePlugin,
			fetchPluginData,
			installPlugin,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPluginsInstallView ) );
