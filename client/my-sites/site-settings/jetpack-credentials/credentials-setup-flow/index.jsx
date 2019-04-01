/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import SetupStart from './setup-start';
import SetupTos from './setup-tos';
import SetupForm from './setup-form';
import SetupFooter from './setup-footer';

/**
 * Style dependencies
 */
import './style.scss';

class CredentialsSetupFlow extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	state = { currentStep: 'start' };

	reset = () => this.setState( { currentStep: 'start' } );

	getNextStep = step =>
		get(
			{
				start: 'tos',
				tos: 'form',
			},
			step,
			step
		);

	goToNextStep = () =>
		this.setState( {
			currentStep: this.getNextStep( this.state.currentStep ),
		} );

	render() {
		const { siteId } = this.props;

		return (
			<div className="credentials-setup-flow">
				{ 'start' === this.state.currentStep && <SetupStart goToNextStep={ this.goToNextStep } /> }
				{ 'tos' === this.state.currentStep && (
					<SetupTos siteId={ siteId } reset={ this.reset } goToNextStep={ this.goToNextStep } />
				) }
				{ 'form' === this.state.currentStep && [
					<SetupForm key="credentials-flow-setup-form" reset={ this.reset } siteId={ siteId } />,
					<SetupFooter key="credentials-flow-setup-form-footer" />,
				] }
			</div>
		);
	}
}

export default localize( CredentialsSetupFlow );
