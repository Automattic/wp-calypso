/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import QuerySites from 'components/data/query-sites';
import NpsSurvey from 'blocks/nps-survey';
import {
	setNpsSurveyDialogShowing,
	setupNpsSurveyDevTrigger,
} from 'state/ui/nps-survey-notice/actions';
import { isNpsSurveyDialogShowing } from 'state/ui/nps-survey-notice/selectors';
import {
	submitNpsSurveyWithNoScore,
	setupNpsSurveyEligibility,
	markNpsSurveyShownThisSession,
} from 'state/nps-survey/actions';
import {
	getNpsSurveyScore,
	hasAnsweredNpsSurvey,
	hasAnsweredNpsSurveyWithNoScore,
	isSectionAndSessionEligibleForNpsSurvey,
	wasNpsSurveyShownThisSession,
} from 'state/nps-survey/selectors';
import { isSupportSession } from 'state/support/selectors';
import getSites from 'state/selectors/get-sites';
import { isBusinessPlan } from 'lib/plans';
import analytics from 'lib/analytics';
import { bumpStat } from 'lib/analytics/mc';

/**
 * Style dependencies
 */
import './style.scss';

const SURVEY_NAME = 'calypso-global-notice-radio-buttons-v1';

class NpsSurveyNotice extends Component {
	state = {
		currentForm: null,
	};

	handleDialogClose = () => {
		const { isBusinessUser, hasAnswered, hasAnsweredWithNoScore, npsSurveyScore } = this.props;

		// the dialog won't close by clicking outside if a business user has submitted a rating of 0-6.
		if (
			isBusinessUser &&
			hasAnswered &&
			npsSurveyScore < 7 &&
			this.state.currentForm !== 'promotion'
		) {
			return;
		}

		if ( ! hasAnswered && ! hasAnsweredWithNoScore ) {
			// the dialog was dismised by clicking outside it
			// and the survey was never answered, so track it
			this.props.submitNpsSurveyWithNoScore( SURVEY_NAME );
		}

		this.props.setNpsSurveyDialogShowing( false );
	};

	handleSurveyClose = afterClose => {
		this.props.setNpsSurveyDialogShowing( false );

		// slightly delay the showing of the thank you notice
		setTimeout( afterClose, 500 );
	};

	handleSurveyFormChange = currentForm => {
		this.setState( { currentForm } );
	};

	componentDidMount() {
		this.props.setupNpsSurveyEligibility();
		this.props.setupNpsSurveyDevTrigger();
	}

	componentDidUpdate() {
		if ( this.props.isSectionAndSessionEligible && ! this.props.wasShownThisSession ) {
			// wait a little bit before showing the notice, so that
			// (1) the user gets a chance to look briefly at the uncluttered screen, and
			// (2) the user notices the notice more, since it will cause a change to the
			//     screen they are already looking at
			this.props.setNpsSurveyDialogShowing( true );
			this.props.markNpsSurveyShownThisSession();

			bumpStat( 'calypso_nps_survey', 'notice_displayed' );
			analytics.tracks.recordEvent( 'calypso_nps_notice_displayed' );
		}
	}

	render() {
		if ( this.props.isSupportSession || ! this.props.isSectionAndSessionEligible ) {
			return null;
		}

		return (
			<Dialog
				additionalClassNames="nps-survey-notice"
				isVisible={ this.props.isNpsSurveyDialogShowing }
				onClose={ this.handleDialogClose }
			>
				<QuerySites allSites />
				<NpsSurvey
					name={ SURVEY_NAME }
					isBusinessUser={ this.props.isBusinessUser }
					onClose={ this.handleSurveyClose }
					onChangeForm={ this.handleSurveyFormChange }
				/>
			</Dialog>
		);
	}
}

function isOwnBusinessSite( site ) {
	return isBusinessPlan( get( site, 'plan.product_slug' ) ) && get( site, 'plan.user_is_owner' );
}

const mapStateToProps = state => {
	return {
		isSupportSession: isSupportSession( state ),
		isNpsSurveyDialogShowing: isNpsSurveyDialogShowing( state ),
		hasAnswered: hasAnsweredNpsSurvey( state ),
		hasAnsweredWithNoScore: hasAnsweredNpsSurveyWithNoScore( state ),
		isSectionAndSessionEligible: isSectionAndSessionEligibleForNpsSurvey( state ),
		wasShownThisSession: wasNpsSurveyShownThisSession( state ),
		npsSurveyScore: getNpsSurveyScore( state ),
		isBusinessUser: getSites( state ).some( isOwnBusinessSite ),
	};
};

export default connect( mapStateToProps, {
	setNpsSurveyDialogShowing,
	submitNpsSurveyWithNoScore,
	setupNpsSurveyDevTrigger,
	setupNpsSurveyEligibility,
	markNpsSurveyShownThisSession,
} )( NpsSurveyNotice );
