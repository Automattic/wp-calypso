/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SettingsPaymentsLocationCurrency from './payments-location-currency';
import SettingsNavigation from '../navigation';
import SettingsPaymentsOffline from './payments-offline';
import SettingsPaymentsOffSite from './payments-off-site';
import SettingsPaymentsOnSite from './payments-on-site';

class SettingsPayments extends Component {

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		className: PropTypes.string,
	};

	render() {
		const { site, translate, className } = this.props;

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Payments' ) }</span> ),
		];

		return (
			<Main
				className={ classNames( 'settingsPayments', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs } />
				<SettingsNavigation />
				<SettingsPaymentsLocationCurrency />
				<SettingsPaymentsOnSite />
				<SettingsPaymentsOffSite />
				<SettingsPaymentsOffline />
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( SettingsPayments ) );
