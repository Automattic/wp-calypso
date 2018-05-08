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
import Button from 'components/button';
import { getSiteBySlug } from 'state/sites/selectors';
import SignupActions from 'lib/signup/actions';

class CloneStartStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	goToNextStep = () => {
		const { originBlogId, originSiteSlug, originSiteName } = this.props;

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			originBlogId,
			originSiteSlug,
			originSiteName,
		} );

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="clone-start__card">
				<img
					alt="upgrade"
					className="clone-start__image"
					src="/calypso/images/upgrades/thank-you.svg"
				/>
				<p className="clone-start__description">
					{ translate(
						'You can use this to create a test or staging site, ' +
							'or just back up your data for safekeeping -- ' +
							"it's up to you!"
					) }
				</p>
				<p className="clone-start__description">
					{ translate(
						'To clone your site, you will need WordPress already ' +
							'installed on the destination site. You will also need ' +
							'the server credentials for the destination site.'
					) }
				</p>
				<Button primary className="clone-start__button" onClick={ this.goToNextStep }>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	};

	render() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			originSiteName,
			translate,
		} = this.props;

		const headerText = translate( "Let's clone %(origin)s", { args: { origin: originSiteName } } );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ '' }
				fallbackSubHeaderText={ '' }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const originSiteSlug = get( ownProps, 'stepSectionName', '' );
	const site = getSiteBySlug( state, originSiteSlug );
	const originSiteName = get( site, 'name', '' );

	return {
		originBlogId: get( site, 'ID', 0 ),
		originSiteName,
		originSiteSlug,
	};
}, null )( localize( CloneStartStep ) );
