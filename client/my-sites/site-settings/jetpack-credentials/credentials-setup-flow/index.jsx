/**
 * External dependencies
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

class CredentialsSetupFlow extends Component {
	static propTypes = {
		isPressable: PropTypes.bool,
		formIsSubmitting: PropTypes.bool,
		siteId: PropTypes.number,
		updateCredentials: PropTypes.func,
		autoConfigCredentials: PropTypes.func,
		autoConfigStatus: PropTypes.string
	};

	componentWillMount() {
		this.setState( { currentStep: 'start', showPopover: false } );
	}

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );

	reset = () => this.setState( { currentStep: 'start' } );

	getNextStep = step => get( {
		start: 'tos',
		tos: 'form',
	}, step, step );

	goToNextStep = () => this.setState( {
		currentStep: this.getNextStep( this.state.currentStep )
	} );

	autoConfigure = () => this.props.autoConfigCredentials( this.props.siteId );

	render() {
		const {
			isPressable,
			formIsSubmitting,
			updateCredentials,
			siteId
		} = this.props;

		return (
			<div className="credentials-setup-flow">
				{ 'start' === this.state.currentStep && (
					<SetupStart
						goToNextStep={ this.goToNextStep }
					/>
				) }
				{ 'tos' === this.state.currentStep && (
					<SetupTos
						autoConfigure={ this.autoConfigure }
						isPressable={ isPressable }
						reset={ this.reset }
						goToNextStep={ this.goToNextStep }
					/>
				) }
				{ 'form' === this.state.currentStep && (
					<SetupForm
						formIsSubmitting={ formIsSubmitting }
						reset={ this.reset }
						siteId={ siteId }
						updateCredentials={ updateCredentials }
					/>
				) }
				<SetupFooter />
			</div>
		);
	}
}

export default localize( CredentialsSetupFlow );
