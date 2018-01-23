/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import CredentialsForm from 'my-sites/site-settings/jetpack-credentials/credentials-form';
import { getSelectedSiteId } from 'state/ui/selectors';

class RewindFormStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	skipStep = () => this.props.goToNextStep();

	onCancel = () => this.props.goToStep( 'rewind-confirm' );

	renderStepContent = () => {
		const { siteId, translate } = this.props;

		return (
			<div className="rewind-form__container">
				<h3 className="rewind-form__title">{ translate( 'Site Credentials' ) }</h3>
				<p>
					{ translate(
						"We'll guide you through the process of getting and entering your site's credentials."
					) }
				</p>
				<CompactCard className="rewind-form__section-title">
					{ translate( 'Enter your credentials' ) }
				</CompactCard>
				<Card className="rewind-form__card">
					<div className="rewind-form__form">
						<CredentialsForm
							{ ...{
								role: 'main',
								protocol: 'ssh',
								port: 22,
								siteId: siteId,
								showCancelButton: true,
								showDeleteButton: false,
								onCancel: this.onCancel,
								onSubmitComplete: this.props.goToNextStep,
							} }
						/>
					</div>
				</Card>
				<CompactCard className="rewind-form__help-link">
					<Gridicon className="rewind-form__help-icon" icon="help" size="16" />
					{ translate( "Need help finding your site's server credentials?" ) }
				</CompactCard>
			</div>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				skipLabelText="Skip"
				hideBack={ true }
				hideSkip={ true }
			/>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
}, null )( localize( RewindFormStep ) );
