/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { find, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { fetchPlugins } from 'state/plugins/installed/actions';
import { getPlugins, isRequesting } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SettingsTaxesPlaceholder from './taxes-placeholder';
import SettingsTaxesTaxJar from './taxes-taxjar';
import SettingsTaxesWooCommerceServices from './taxes-wcs';
import {
	areSetupChoicesLoaded,
	getCheckedTaxSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import { setCheckedTaxSetup } from 'woocommerce/state/sites/setup-choices/actions';

class SettingsTaxes extends Component {
	static propTypes = {
		className: PropTypes.string,
		isRequestingSitePlugins: PropTypes.bool,
		siteId: PropTypes.number,
		sitePluginsLoaded: PropTypes.bool,
		siteSlug: PropTypes.string,
		taxJarPluginActive: PropTypes.bool,
		setupChoicesLoaded: PropTypes.bool,
		taxesAreSetUp: PropTypes.bool,
		setCheckedTaxSetup: PropTypes.func,
	};

	maybeFetchPlugins = ( props, force = false ) => {
		const { isRequestingSitePlugins, siteId, sitePluginsLoaded } = props;

		if ( siteId && ! isRequestingSitePlugins ) {
			if ( force || ! sitePluginsLoaded ) {
				this.props.fetchPlugins( [ siteId ] );
			}
		}
	};

	componentDidMount = () => {
		this.maybeFetchPlugins( this.props, true );

		if ( true === this.props.setupChoicesLoaded ) {
			this.maybeSetCheckedTaxSetup();
		}
	};

	componentWillReceiveProps = newProps => {
		this.maybeFetchPlugins( newProps );
	};

	componentDidUpdate = prevProps => {
		if ( true === this.props.setupChoicesLoaded && false === prevProps.setupChoicesLoaded ) {
			this.maybeSetCheckedTaxSetup();
		}
	};

	maybeSetCheckedTaxSetup = () => {
		const { taxesAreSetUp, site } = this.props;
		if ( taxesAreSetUp ) {
			return;
		}
		this.props.setCheckedTaxSetup( site.ID, true );
	};

	render = () => {
		const { className, site, siteId, sitePluginsLoaded, siteSlug, taxJarPluginActive } = this.props;

		const renderTaxesByTaxJar = taxJarPluginActive;
		const renderTaxesByWCS = sitePluginsLoaded && ! taxJarPluginActive;
		const renderPlaceholder = ! renderTaxesByTaxJar && ! renderTaxesByWCS;

		return (
			<Main className={ classNames( 'settings-taxes', className ) } wideLayout>
				{ renderPlaceholder && <SettingsTaxesPlaceholder siteSlug={ siteSlug } /> }
				{ renderTaxesByTaxJar && <SettingsTaxesTaxJar site={ site } /> }
				{ renderTaxesByWCS && (
					<SettingsTaxesWooCommerceServices siteId={ siteId } siteSlug={ siteSlug } />
				) }
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	const siteSlug = site ? site.slug : '';

	const isRequestingSitePlugins = site ? isRequesting( state, siteId ) : false;
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const sitePluginsLoaded = ! isEmpty( sitePlugins );
	const taxJarPluginActive = !! find( sitePlugins, {
		slug: 'taxjar-simplified-taxes-for-woocommerce',
		active: true,
	} );

	const setupChoicesLoaded = areSetupChoicesLoaded( state, siteId );
	const taxesAreSetUp = getCheckedTaxSetup( state, siteId );

	return {
		isRequestingSitePlugins,
		site,
		siteId,
		sitePluginsLoaded,
		siteSlug,
		taxJarPluginActive,
		setupChoicesLoaded,
		taxesAreSetUp,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPlugins,
			setCheckedTaxSetup,
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsTaxes ) );
