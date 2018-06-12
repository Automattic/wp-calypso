/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import { autoConfigCredentials } from 'state/jetpack/credentials/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class CredsConfirmStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,

		// Connected props
		siteSlug: PropTypes.string.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	autoConfigCredentials = () => this.props.autoConfigCredentials( this.props.siteId );

	skipStep = () => {
		this.props.recordTracksEvent( 'calypso_pressable_nux_credentials_skip', {} );

		if ( 'pressable-nux' === this.props.flowName ) {
			this.props.goToNextStep();
		} else {
			// The flow /start/rewind-auto-config exits back to AL on the second skip
			return page.redirect( `/stats/activity/${ this.props.siteSlug }` );
		}
	};

	shareCredentials = () => {
		this.autoConfigCredentials();

		this.props.recordTracksEvent( 'calypso_pressable_nux_credentials_share', {} );

		SignupActions.submitSignupStep(
			{
				processingMessage: this.props.translate( 'Setting up your site' ),
				stepName: this.props.stepName,
			},
			{ rewindconfig: true }
		);

		this.props.goToStep(
			'pressable-nux' === this.props.flowName ? 'creds-complete' : 'rewind-were-backing'
		);
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="creds-confirm__card">
				<h3 className="creds-confirm__title">{ translate( 'Are you sure?' ) }</h3>
				<img className="creds-confirm__image" src="/calypso/images/illustrations/security.svg" />
				<p className="creds-confirm__description">
					{ translate(
						"If you don't share credentials with Jetpack, your site won't be backed up. Our " +
							'support staff is available to answer any questions you might have.'
					) }
				</p>
				<Button primary onClick={ this.shareCredentials }>
					{ translate( 'Share credentials' ) }
				</Button>
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
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				skipLabelText="Skip"
				hideBack={ true }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 );
		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state, siteId ),
		};
	},
	{
		autoConfigCredentials,
		recordTracksEvent,
	}
)( localize( CredsConfirmStep ) );
