/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import SignupActions from 'lib/signup/actions';
import RewindCredentialsForm from 'components/rewind-credentials-form';
import { getRewindState } from 'state/selectors';

class RewindFormCreds extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,

		// Connected props
		siteId: PropTypes.number.isRequired,
		rewindIsNowActive: PropTypes.bool.isRequired,
	};

	/**
	 * Before component updates, check if credentials were correctly saved and go to next step.
	 *
	 * @param {object} nextProps Props received by component for next update.
	 */
	componentWillUpdate( nextProps ) {
		if ( this.props.rewindIsNowActive !== nextProps.rewindIsNowActive ) {
			SignupActions.submitSignupStep( {
				processingMessage: this.props.translate( 'Migrating your credentials' ),
				stepName: this.props.stepName,
			} );
			this.props.goToNextStep();
		}
	}

	stepContent = () => {
		const { translate, siteId } = this.props;

		return (
			<Card className="rewind-form-creds__card rewind-switch__card rewind-switch__content">
				<h3 className="rewind-form-creds__title rewind-switch__heading">
					{ translate( 'Site credentials' ) }
				</h3>
				<p className="rewind-form-creds__description rewind-switch__description">
					{ translate(
						"We'll guide you through the process of finding and entering your site's credentials."
					) }
				</p>
				<RewindCredentialsForm role="main" siteId={ siteId } allowCancel={ false } />
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.stepContent() }
				hideFormattedHeader={ true }
				hideSkip={ true }
				hideBack={ true }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = parseInt( get( ownProps, [ 'initialContext', 'query', 'siteId' ], 0 ) );
	const rewindState = getRewindState( state, siteId );
	return {
		siteId,
		rewindIsNowActive: 'active' === rewindState.state,
	};
}, null )( localize( RewindFormCreds ) );
