/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import { getSiteBySlug } from 'state/sites/selectors';
import SignupActions from 'lib/signup/actions';

class CloneCloningStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	goToActivityLog = () => {
		const { originSiteSlug } = this.props;

		page.redirect( `/stats/activity/${ originSiteSlug }` );
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="clone-cloning__card">
				<img
					alt="upgrade"
					className="clone-cloning__image"
					src="/calypso/images/upgrades/thank-you.svg"
				/>
				<p className="clone-cloning__description">
					{ translate(
						'Alrighy, Jetpack is cloning your site. You will be notified when the ' +
							'clone process is finished or you can watch the progress in ' +
							'real-time on the Activity Log.'
					) }
				</p>
				<Button primary className="clone-cloning__button" onClick={ this.goToActivityLog }>
					{ translate( 'To the Activity Log!' ) }
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

		const headerText = translate( "We're cloning %(originSiteName)s - sit tight!", {
			args: { originSiteName },
		} );

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
	return {
		originSiteName: get( ownProps, [ 'signupDependencies', 'originSiteName' ], '' ),
		originSiteSlug: get( ownProps, [ 'signupDependencies', 'originSiteSlug' ], '' ),
	};
}, null )( localize( CloneCloningStep ) );
