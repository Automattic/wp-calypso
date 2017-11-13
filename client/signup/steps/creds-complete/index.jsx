/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';

class CredsCompleteStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	renderStepContent = () => {
		const { translate, wpAdminUrl } = this.props;

		return (
			<Card className="creds-complete__card">
				<h3 className="creds-complete__title">{ translate( 'Your site is set up and ready!' ) }</h3>
				<img className="creds-complete__image" src="/calypso/images/upgrades/thank-you.svg" />
				<p className="creds-complete__description">
					{ translate(
						'Your site is backing up because your site is set up with Jetpack Premium plan at ' +
							'no additional cost to you. Finish setting up Jetpack and your site is ready to be ' +
							'transformed into the site of your dreams.'
					) }
				</p>
				<a className="creds-complete__button" href={ wpAdminUrl }>
					{ translate( 'Continue' ) }
				</a>
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
				hideBack={ true }
				hideSkip={ true }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const blogId = get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 );
	const blogUrl = get( state, [ 'sites', 'items', blogId, 'URL' ], false );

	return {
		wpAdminUrl: blogUrl ? blogUrl + '/wp-admin/' : false,
	};
}, null )( localize( CredsCompleteStep ) );
