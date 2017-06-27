/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { installPlugin } from 'state/plugins/installed/actions';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';
import { setFinishedInstallOfRequiredPlugins } from 'woocommerce/state/sites/setup-choices/actions';

const requiredPlugins = [
	'woocommerce',
	// 'wc-api-dev',
	'woocommerce-gateway-stripe',
	'woocommerce-services',
];

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		fetchPluginData: PropTypes.func.isRequired,
		installPlugin: PropTypes.func.isRequired,
		plugins: PropTypes.array,
		setFinishedInstallOfRequiredPlugins: PropTypes.func.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		wpOrg: PropTypes.array,
	};

	constructor( props ) {
		super( props );
		this.state = {
			installingPlugin: null,
			progress: 0,
		};
	}

	componentDidMount = () => {
		const { plugins } = this.props;

		if ( plugins && plugins.length ) {
			this.installPlugins( plugins );
		}

		this.getWporgPluginData();
	}

	componentDidUpdate = ( prevProps ) => {
		if (
			( this.props.plugins && this.props.plugins.length && ! this.state.installingPlugin ) ||
			( prevProps.plugins && this.props.plugins.length > prevProps.plugins.length )
		) {
			this.installPlugins( this.props.plugins );
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
		const { site, wporg } = this.props;
		let isRunningInstall = false;
		for ( let i = 0; i < requiredPlugins.length; i++ ) {
			const slug = requiredPlugins[ i ];
			const plugin = find( plugins, { slug } );
			if ( ! plugin ) {
				if ( ! wporg[ slug ] ) {
					return;
				}
				const wporgPlugin = getPlugin( wporg, slug );
				this.setState( { installingPlugin: slug } );
				this.setState( { progress: this.state.progress + 25 } );
				this.props.installPlugin( site.ID, wporgPlugin );
				isRunningInstall = true;
				return;
			}
		}
		if ( ! isRunningInstall ) {
			this.props.setFinishedInstallOfRequiredPlugins(
				site.ID,
				true
			);
		}
	}

	render = () => {
		const { translate, site } = this.props;
		return (
			<div className="card dashboard__setup-wrapper">
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
				{ site.canUpdateFiles && <QueryPluginKeys siteId={ site.ID } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Setting up your store' ) }
					subtitle={ translate( 'Give us a minute and we\'ll move right along.' ) }
				>
					<ProgressBar value={ this.state.progress } isPulsing />
				</SetupHeader>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
		plugins: getPlugins( state, [ { ID: site.ID } ] ),
		wporg: state.plugins.wporg.items,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPluginData,
			installPlugin,
			setFinishedInstallOfRequiredPlugins,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPluginsInstallView ) );
