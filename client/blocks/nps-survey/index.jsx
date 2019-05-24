/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isNumber, noop, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextArea from 'components/forms/form-textarea';
import ScreenReaderText from 'components/screen-reader-text';
import QuerySites from 'components/data/query-sites';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
} from 'state/nps-survey/actions';
import { successNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { hasAnsweredNpsSurvey } from 'state/nps-survey/selectors';
import getSites from 'state/selectors/get-sites';
import { isBusinessPlan } from 'lib/plans';
import { CALYPSO_CONTACT } from 'lib/url/support';
import analytics from 'lib/analytics';
import RecommendationSelect from './recommendation-select';

export class NpsSurvey extends Component {
	static propTypes = {
		onClose: PropTypes.func,
		name: PropTypes.string,
		hasAnswered: PropTypes.bool,
		isBusinessUser: PropTypes.bool,
		canRequestConciergeSession: PropTypes.bool,
	};

	static defaultProps = {
		hasAnswered: false,
		isBusinessUser: false,
		canRequestConciergeSession: false,
	};

	state = {
		score: null,
		feedback: '',
		currentForm: 'score', // score, feedback or promotion
	};

	handleRecommendationSelectChange = score => {
		this.setState( { score } );
	};

	handleSubmitScore = () => {
		this.props.submitNpsSurvey( this.props.name, this.state.score );
		this.setState( { currentForm: 'feedback' } );
	};

	handleDismissClick = () => {
		if ( ! this.props.hasAnswered ) {
			this.props.submitNpsSurveyWithNoScore( this.props.name );
		}
		this.onClose( noop );
	};

	handleTextBoxChange = event => {
		this.setState( { feedback: trim( event.target.value ) } );
	};

	handleSendFeedbackClick = () => {
		this.props.sendNpsSurveyFeedback( this.props.name, this.state.feedback );
		if ( this.shouldShowPromotion() ) {
			this.setState( { currentForm: 'promotion' } );
		} else {
			this.onClose( this.showThanksNotice );
		}
	};

	handleFeedbackFormClose = () => {
		if ( this.shouldShowPromotion() ) {
			this.setState( { currentForm: 'promotion' } );
		} else {
			this.onClose( this.showThanksNotice );
		}
	};

	handlePromotionClose = () => {
		this.onClose( noop );
	};

	handleLinkClick = event => {
		this.props.recordTracksEvent( 'calypso_nps_survey_link_clicked', {
			url: event.target.href,
		} );
	};

	showThanksNotice = () => {
		this.props.successNotice( this.props.translate( 'Thanks for your feedback!' ), {
			duration: 5000,
		} );
	};

	onClose = afterClose => {
		// ensure that state is updated before onClose handler is called
		setTimeout( () => {
			this.props.onClose( afterClose );
		}, 0 );
	};

	componentWillMount() {
		analytics.mc.bumpStat( 'calypso_nps_survey', 'survey_displayed' );
		analytics.tracks.recordEvent( 'calypso_nps_survey_displayed' );
	}

	shouldShowPromotion() {
		return this.props.isBusinessUser && isNumber( this.state.score ) && this.state.score < 7;
	}

	renderScoreForm() {
		const { translate } = this.props;

		return (
			<Fragment>
				<div className="nps-survey__question">
					{ translate(
						'How likely are you to recommend WordPress.com to your friends, family, or colleagues?'
					) }
				</div>
				<div className="nps-survey__recommendation-select-wrapper">
					<RecommendationSelect
						value={ this.state.score }
						disabled={ this.props.hasAnswered }
						onChange={ this.handleRecommendationSelectChange }
					/>
				</div>
				<div className="nps-survey__buttons">
					<Button
						primary
						className="nps-survey__finish-button"
						disabled={ this.props.hasAnswered }
						onClick={ this.handleSubmitScore }
					>
						{ translate( 'Submit' ) }
					</Button>
					<Button
						borderless
						className="nps-survey__not-answer-button"
						disabled={ this.props.hasAnswered }
						onClick={ this.handleDismissClick }
					>
						{ translate( 'Close' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	renderFeedbackForm() {
		const { translate } = this.props;

		return (
			<Fragment>
				<div className="nps-survey__question">
					{ translate( 'What is the most important reason for your score?' ) }
				</div>
				<div className="nps-survey__recommendation-select-wrapper">
					<FormTextArea
						onChange={ this.handleTextBoxChange }
						placeholder={ translate( 'Please input your thoughts here' ) }
					/>
				</div>
				<div className="nps-survey__buttons">
					<Button
						primary
						className="nps-survey__finish-button"
						disabled={ ! this.state.feedback }
						onClick={ this.handleSendFeedbackClick }
					>
						{ translate( 'Submit' ) }
					</Button>
					<Button
						borderless
						className="nps-survey__not-answer-button"
						onClick={ this.handleFeedbackFormClose }
					>
						{ this.shouldShowPromotion() ? translate( 'Skip' ) : translate( 'Close' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	renderPromotion() {
		const { canRequestConciergeSession, translate } = this.props;

		return (
			<div className="nps-survey__promotion">
				<p>{ translate( 'Thank you for your feedback: We’d like to help!' ) }</p>
				{ canRequestConciergeSession && (
					<Fragment>
						<p>
							{ translate(
								'You have a free, 45-minute one-on-one call with a website expert as part of your WordPress.com Business plan benefits.'
							) }
						</p>
						<p>
							{ translate(
								'{{booking}}Reserve a 1:1 Support Session{{/booking}} now or connect with the support team {{contact}}over live chat or email{{/contact}}.',
								{
									components: {
										booking: <a href="/me/concierge" onClick={ this.handleLinkClick } />,
										contact: <a href={ CALYPSO_CONTACT } onClick={ this.handleLinkClick } />,
									},
								}
							) }
						</p>
					</Fragment>
				) }
				{ ! canRequestConciergeSession && (
					<p>
						{ translate(
							'Connect with the WordPress.com support team {{contact}}over live chat or email{{/contact}} right now and we’d love to help you as best we can.',
							{
								components: {
									contact: <a href={ CALYPSO_CONTACT } onClick={ this.handleLinkClick } />,
								},
							}
						) }
					</p>
				) }
				<div className="nps-survey__buttons">
					<Button
						primary
						className="nps-survey__finish-button"
						onClick={ this.handlePromotionClose }
					>
						{ translate( 'Close' ) }
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const { translate } = this.props;
		const className = classNames( 'nps-survey', {
			'is-recommendation-selected': Number.isInteger( this.state.score ),
			'is-submitted': this.props.hasAnswered,
		} );

		return (
			<Card className={ className }>
				<QuerySites allSites />
				<Button
					borderless
					className="nps-survey__close-button"
					disabled={ this.state.currentForm === 'feedback' && this.shouldShowPromotion() }
					onClick={
						this.state.currentForm === 'feedback'
							? this.handleFeedbackFormClose
							: this.handleDismissClick
					}
				>
					<Gridicon icon="cross" />
					<ScreenReaderText>{ translate( 'Close' ) }</ScreenReaderText>
				</Button>
				<div className="nps-survey__question-screen">
					{ this.state.currentForm === 'score' && this.renderScoreForm() }
					{ this.state.currentForm === 'feedback' && this.renderFeedbackForm() }
					{ this.state.currentForm === 'promotion' && this.renderPromotion() }
				</div>
			</Card>
		);
	}
}

function isOwnBusinessSite( site ) {
	return isBusinessPlan( get( site, 'plan.product_slug' ) ) && get( site, 'plan.user_is_owner' );
}

const mapStateToProps = state => {
	const businessSites = getSites( state ).filter( isOwnBusinessSite );
	// TODO: check if the user can request concierge sessions.
	const canRequestConciergeSession = false;

	return {
		hasAnswered: hasAnsweredNpsSurvey( state ),
		isBusinessUser: businessSites.length > 0,
		canRequestConciergeSession,
	};
};

export default connect(
	mapStateToProps,
	{
		submitNpsSurvey,
		submitNpsSurveyWithNoScore,
		sendNpsSurveyFeedback,
		successNotice,
		recordTracksEvent,
	}
)( localize( NpsSurvey ) );
