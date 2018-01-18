/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import SetupStart from './setup-start';
import SetupTos from './setup-tos';
import SetupForm from './setup-form';
import SetupFooter from './setup-footer';
import { getCredentialsAutoConfigStatus } from 'state/selectors';

class CredentialsSetupFlow extends Component {
	static propTypes = {
		canAutoconfigure: PropTypes.bool,
		formIsSubmitting: PropTypes.bool,
		siteId: PropTypes.number,
		autoConfigStatus: PropTypes.string,
	};

	state = {
		currentStep: 'start',
		showPopover: false,
	};

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
		const { canAutoconfigure, formIsSubmitting, siteId } = this.props;

		return (
			<div className="credentials-setup-flow">
				{ 'start' === this.state.currentStep && <SetupStart goToNextStep={ this.goToNextStep } /> }
				{ 'tos' === this.state.currentStep && (
					<SetupTos
						canAutoconfigure={ canAutoconfigure }
						goToNextStep={ this.goToNextStep }
						reset={ this.reset }
						siteId={ siteId }
					/>
				) }
				{ 'form' === this.state.currentStep && [
					<SetupForm
						key="credentials-flow-setup-form"
						formIsSubmitting={ formIsSubmitting }
						reset={ this.reset }
						siteId={ siteId }
					/>,
					<SetupFooter key="credentials-flow-setup-form-footer" />,
				] }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	autoConfigStatus: getCredentialsAutoConfigStatus( state, siteId ),
} );

export default connect( mapStateToProps )( localize( CredentialsSetupFlow ) );
