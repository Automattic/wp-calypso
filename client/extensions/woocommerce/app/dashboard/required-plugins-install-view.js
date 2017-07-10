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
import { installPlugin, activatePlugin, fetchPlugins } from 'state/plugins/installed/actions';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';
import { setFinishedInstallOfRequiredPlugins } from 'woocommerce/state/sites/setup-choices/actions';
import wp from 'lib/wp';

const requiredPlugins = [
	'wc-api-dev',
	'woocommerce',
	'woocommerce-gateway-stripe',
	'woocommerce-services',
	'taxjar-simplified-taxes-for-woocommerce',
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
			activatingPlugin: null,
			installingPlugin: null,
			progress: 0,
		};
	}

	componentDidMount = () => {
		const { plugins, site } = this.props;

		if ( site && plugins && plugins.length ) {
			this.installPlugins( plugins );
		}

		this.getWporgPluginData();
	}

	componentWillUnmount = () => {
		this.cancelUpdateTimeout();
	}

	componentDidUpdate = ( prevProps ) => {
		const { plugins, site } = this.props;
		if ( ! plugins || ! site ) {
			return;
		}
		const isReady = plugins.length && ! this.state.installingPlugin && ! this.state.activatingPlugin;
		const isDoneInstalling = prevProps.plugins && plugins.length > prevProps.plugins.length;
		const activatingPlugin = find( plugins, { slug: this.state.activatingPlugin } );
		const isDoneActivating = activatingPlugin && activatingPlugin.active;
		if (
			isReady ||
			( isDoneInstalling || isDoneActivating )
		) {
			this.installPlugins( this.props.plugins );
		}
	}

	getWporgPluginData() {
		requiredPlugins.map( plugin => {
			if ( 'wc-api-dev' === plugin ) {
				return;
			}
			const pluginData = getPlugin( this.props.wporg, plugin );
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin );
			}
		} );
	}

	installApiDevPlugin = ( siteId ) => {
		const progress = this.state.progress + ( 100 / requiredPlugins.length );
		this.setState( () => ( {
			installingPlugin: 'wc-api-dev',
			progress,
		} ) );

		const afterApiPluginInstalled = () => {
			this.setState( () => ( { installingPlugin: null } ) );
			this.props.fetchPlugins( [ siteId ] );
		};

		wp.req.post( {
			path: `/sites/${ siteId }/woocommerce/install-api-dev-plugin`
		} ).then( afterApiPluginInstalled );
	}

	installPlugins = ( plugins ) => {
		this.cancelUpdateTimeout();
		const { site, wporg } = this.props;
		for ( let i = 0; i < requiredPlugins.length; i++ ) {
			const slug = requiredPlugins[ i ];
			const plugin = find( plugins, { slug } );

			if ( ! plugin ) {
				if ( 'wc-api-dev' === slug ) {
					if ( 'wc-api-dev' !== this.state.installingPlugin ) {
						this.installApiDevPlugin( site.ID );
					}

					return;
				}

				if ( ! wporg[ slug ] ) {
					return;
				}

				const wporgPlugin = getPlugin( wporg, slug );
				const progress = this.state.progress + ( 100 / requiredPlugins.length );
				this.setState( () => ( {
					installingPlugin: slug,
					progress,
				} ) );
				this.props.installPlugin( site.ID, wporgPlugin );
				this.setUpdateTimeout();
				return;
			}
			if ( ! plugin.active ) {
				const wporgPlugin = getPlugin( wporg, slug );
				this.setState( () => ( { activatingPlugin: slug } ) );
				this.props.activatePlugin( site.ID, { ...wporgPlugin, id: plugin.id } );
				this.setUpdateTimeout();
				return;
			}
		}
		this.props.setFinishedInstallOfRequiredPlugins(
			site.ID,
			true
		);
	}

	cancelUpdateTimeout = () => {
		if ( this.updateTimeout ) {
			window.clearTimeout( this.updateTimeout );
		}
	}

	setUpdateTimeout = () => {
		this.updateTimeout = window.setTimeout( () => {
			this.installPlugins( this.props.plugins );
		}, 10000 );
	}

	render = () => {
		const { translate, site } = this.props;
		return (
			<div className="card dashboard__setup-wrapper">
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-store-creation.svg' }
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
		plugins: getPlugins( state, [ site ] ),
		wporg: state.plugins.wporg.items,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			activatePlugin,
			fetchPluginData,
			fetchPlugins,
			installPlugin,
			setFinishedInstallOfRequiredPlugins,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPluginsInstallView ) );
