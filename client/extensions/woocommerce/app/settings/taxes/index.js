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

class SettingsTaxes extends Component {
	static propTypes = {
		className: PropTypes.string,
		isRequestingSitePlugins: PropTypes.bool,
		siteId: PropTypes.number,
		sitePluginsLoaded: PropTypes.bool,
		siteSlug: PropTypes.string,
		taxJarPluginActive: PropTypes.bool,
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
	};

	componentWillReceiveProps = newProps => {
		this.maybeFetchPlugins( newProps );
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

	return {
		isRequestingSitePlugins,
		site,
		siteId,
		sitePluginsLoaded,
		siteSlug,
		taxJarPluginActive,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPlugins,
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsTaxes ) );
