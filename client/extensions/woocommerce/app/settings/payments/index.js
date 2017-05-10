/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SettingsPaymentsLocationCurrency from './paymentsLocationCurrency';
import SettingsPaymentsOffline from './paymentsOffline';
import SettingsPaymentsOffSite from './paymentsOffSite';
import SettingsPaymentsOnSite from './paymentsOnSite';

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
