/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SettingsPaymentsLocationCurrency from './payments-location-currency';
import SettingsPaymentsOffline from './payments-offline';
import SettingsPaymentsOffSite from './payments-off-site';
import SettingsPaymentsOnSite from './payments-on-site';

class SettingsPayments extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		return (
			<Main
				className={ classNames( 'settingsPayments', this.props.className ) }>
				<SettingsPaymentsLocationCurrency />
				<SettingsPaymentsOnSite />
				<SettingsPaymentsOffSite />
				<SettingsPaymentsOffline />
			</Main>
		);
	}

}

export default SettingsPayments;
