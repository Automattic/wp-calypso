/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import ActivityLogItem from 'my-sites/stats/activity-log-item';

import QuerySites from 'components/data/query-sites';
import QueryActivityLog from 'components/data/query-activity-log';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteSettings from 'components/data/query-site-settings';

import { getSiteGmtOffset, getSiteTimezoneValue, getActivityLogs } from 'state/selectors';
import {
	adjustMoment,
	getActivityLogQuery,
	getStartMoment,
} from 'my-sites/stats/activity-log/utils';

class CloneJetpackStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	selectNew = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			cloneJetpack: 'new',
		} );

		this.props.goToNextStep();
	};

	selectMigrate = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			cloneJetpack: 'migrate',
		} );

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { originSiteName, destinationSiteName, translate } = this.props;

		return (
			<div>
				<div className="clone-jetpack__column">
					<Card className="clone-jetpack__image-card">
						<img
							alt="upgrade"
							className="clone-jetpack__image"
							src="/calypso/images/upgrades/thank-you.svg"
						/>
					</Card>
					<Card className="clone-jetpack__text-card">
						<Button className="clone-jetpack__button" onClick={ this.selectNew }>
							{ translate( 'Create new Jetpack connection' ) }
						</Button>
						<p className="clone-jetpack__description">
							{ translate(
								'Keep the plan on %(originSiteName)s and create a new Jetpack connection on %(destinationSiteName)s.',
								{
									args: { originSiteName, destinationSiteName },
								}
							) }
						</p>
					</Card>
				</div>
				<div className="clone-jetpack__column">
					<Card className="clone-jetpack__image-card">
						<img
							alt="upgrade"
							className="clone-jetpack__image"
							src="/calypso/images/upgrades/thank-you.svg"
						/>
					</Card>
					<Card className="clone-jetpack__text-card">
						<Button className="clone-jetpack__button" onClick={ this.selectMigrate }>
							{ translate( 'Migrate Jetpack plan' ) }
						</Button>
						<p className="clone-jetpack__description">
							{ translate(
								'Browse your event history and choose an earlier state to clone from.'
							) }
						</p>
					</Card>
				</div>
			</div>
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

		const headerText = translate( 'Your Jetpack connection' );
		const subHeaderText = translate(
			'What would you like us to do with your Jetpack connection and plan?'
		);

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		originSiteName: get( ownProps, [ 'signupDependencies', 'originSiteName' ], '' ),
		destinationSiteName: get( ownProps, [ 'signupDependencies', 'destinationSiteName' ] ),
	};
} )( localize( CloneJetpackStep ) );
