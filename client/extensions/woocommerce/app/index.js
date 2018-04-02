/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { areAllRequiredPluginsActive } from 'woocommerce/state/selectors/plugins';
import {
	canCurrentUser,
	isSiteAutomatedTransfer,
	hasSitePendingAutomatedTransfer,
} from 'state/selectors';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isLoaded as arePluginsLoaded } from 'state/plugins/installed/selectors';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import RequiredPluginsInstallView from 'woocommerce/app/dashboard/required-plugins-install-view';
import WooCommerceColophon from 'woocommerce/components/woocommerce-colophon';

class App extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		documentTitle: PropTypes.string,
		canUserManageOptions: PropTypes.bool.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		hasPendingAutomatedTransfer: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
	};

	componentDidMount() {
		this.fetchData( this.props );
	}

	componentWillReceiveProps( newProps ) {
		if ( this.props.children !== newProps.children ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentDidUpdate( prevProps ) {
		const { allRequiredPluginsActive, pluginsLoaded, siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		// If the site has changed, or plugin status has changed, re-fetch data
		if (
			siteId !== oldSiteId ||
			prevProps.allRequiredPluginsActive !== allRequiredPluginsActive ||
			prevProps.pluginsLoaded !== pluginsLoaded
		) {
			this.fetchData( this.props );
		}
	}

	fetchData( { allRequiredPluginsActive, pluginsLoaded, siteId } ) {
		if ( ! siteId ) {
			return;
		}

		// We don't know yet if we can get a response
		if ( ! pluginsLoaded || ! allRequiredPluginsActive ) {
			return;
		}

		this.props.fetchSetupChoices( siteId );
	}

	redirect() {
		window.location.href = '/stats/day';
	}

	maybeRenderChildren() {
		const { allRequiredPluginsActive, children, pluginsLoaded, translate } = this.props;
		if ( ! pluginsLoaded ) {
			return null;
		}

		if ( pluginsLoaded && ! allRequiredPluginsActive ) {
			return (
				<RequiredPluginsInstallView title={ translate( 'Updating your store' ) } skipConfirmation />
			);
		}

		return children;
	}

	render = () => {
		const {
			siteId,
			canUserManageOptions,
			isAtomicSite,
			hasPendingAutomatedTransfer,
			translate,
		} = this.props;
		if ( ! siteId ) {
			return null;
		}

		if (
			! isAtomicSite &&
			! hasPendingAutomatedTransfer &&
			! config.isEnabled( 'woocommerce/store-on-non-atomic-sites' )
		) {
			this.redirect();
			return null;
		}

		if ( ! canUserManageOptions ) {
			this.redirect();
			return null;
		}

		const documentTitle = this.props.documentTitle || translate( 'Store' );

		const className = 'woocommerce';
		return (
			<div className={ className }>
				<DocumentHead title={ documentTitle } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ this.maybeRenderChildren() }
				<WooCommerceColophon />
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const isAtomicSite = !! isSiteAutomatedTransfer( state, siteId );
	const hasPendingAutomatedTransfer = !! hasSitePendingAutomatedTransfer( state, siteId );

	const pluginsLoaded = arePluginsLoaded( state, siteId );
	const allRequiredPluginsActive = areAllRequiredPluginsActive( state, siteId );

	return {
		siteId,
		allRequiredPluginsActive,
		canUserManageOptions: siteId ? canUserManageOptions : false,
		isAtomicSite: siteId ? isAtomicSite : false,
		hasPendingAutomatedTransfer: siteId ? hasPendingAutomatedTransfer : false,
		pluginsLoaded,
	};
}

export default connect( mapStateToProps, { fetchSetupChoices } )( localize( App ) );
