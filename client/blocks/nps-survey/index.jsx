/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent, Fragment } from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { isNumber, noop, trim } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card, ScreenReaderText } from '@automattic/components';
import FormTextArea from 'components/forms/form-textarea';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
} from 'state/nps-survey/actions';
import { successNotice } from 'state/notices/actions';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { hasAnsweredNpsSurvey, isAvailableForConciergeSession } from 'state/nps-survey/selectors';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { bumpStat } from 'lib/analytics/mc';
import { recordTracksEvent } from 'lib/analytics/tracks';
import RecommendationSelect from './recommendation-select';

/**
 * Style dependencies
 */
import './style.scss';

export class NpsSurvey extends PureComponent {
	static propTypes = {
		onChangeForm: PropTypes.func,
		onClose: PropTypes.func,
		name: PropTypes.string,
		hasAnswered: PropTypes.bool,
		isBusinessUser: PropTypes.bool,
		hasAvailableConciergeSession: PropTypes.bool,
	};

	static defaultProps = {
		hasAnswered: false,
		isBusinessUser: false,
		hasAvailableConciergeSession: false,
	};

	state = {
		score: null,
		feedback: '',
		currentForm: 'score', // score, feedback or promotion
	};

	componentDidUpdate( _, prevState ) {
		const { hasAvailableConciergeSession, onChangeForm } = this.props;

		if ( prevState.currentForm !== this.state.currentForm ) {
			onChangeForm && onChangeForm( this.state.currentForm );
			this.props.recordTracksEventAction( 'calypso_nps_survey_page_displayed', {
				name: this.state.currentForm,
				has_available_concierge_sessions: hasAvailableConciergeSession,
			} );
		}
	}

	handleRecommendationSelectChange = ( score ) => {
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

	handleTextBoxChange = ( event ) => {
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

	handleLinkClick = ( event ) => {
		this.props.recordTracksEventAction( 'calypso_nps_survey_link_clicked', {
			url: event.target.href,
			type: event.target.dataset.type,
		} );
		this.onClose( noop );
	};

	showThanksNotice = () => {
		this.props.successNotice( this.props.translate( 'Thanks for your feedback!' ), {
			duration: 5000,
		} );
	};

	onClose = ( afterClose ) => {
		// ensure that state is updated before onClose handler is called
		setTimeout( () => {
			this.props.onClose( afterClose );
		}, 0 );
	};

	UNSAFE_componentWillMount() {
		bumpStat( 'calypso_nps_survey', 'survey_displayed' );
		recordTracksEvent( 'calypso_nps_survey_displayed' );
	}

	shouldShowPromotion() {
		return (
			[ 'en', 'en-gb' ].indexOf( getLocaleSlug() ) >= 0 &&
			this.props.isBusinessUser &&
			isNumber( this.state.score ) &&
			this.state.score < 7
		);
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
					{ ! this.shouldShowPromotion() && (
						<Button
							borderless
							className="nps-survey__not-answer-button"
							onClick={ this.handleFeedbackFormClose }
						>
							{ translate( 'Close' ) }
						</Button>
					) }
				</div>
			</Fragment>
		);
	}

	renderPromotion() {
		const { hasAvailableConciergeSession, translate } = this.props;

		return (
			<div className="nps-survey__promotion">
				<p>{ translate( 'Thank you for your feedback!' ) }</p>
				{ hasAvailableConciergeSession && (
					<Fragment>
						<p>
							{ translate(
								'You have a free, 30-minute one-on-one call with a website expert as part of your WordPress.com Business plan benefits.'
							) }
						</p>
						<p>
							{ translate(
								'{{booking}}Reserve a 1:1 Quick Start Session{{/booking}} now or connect with a Happiness Engineer {{contact}}over live chat or email{{/contact}}.',
								{
									components: {
										booking: (
											<a
												href="/me/concierge"
												onClick={ this.handleLinkClick }
												data-type="booking"
											/>
										),
										contact: (
											<a
												href={ CALYPSO_CONTACT }
												onClick={ this.handleLinkClick }
												data-type="contact"
											/>
										),
									},
								}
							) }
						</p>
					</Fragment>
				) }
				{ ! hasAvailableConciergeSession && (
					<p>
						{ translate(
							'If you would like help with your site, our WordPress.com Happiness Engineers are ready {{contact}}over live chat or email{{/contact}} now.',
							{
								components: {
									contact: (
										<a
											href={ CALYPSO_CONTACT }
											onClick={ this.handleLinkClick }
											data-type="contact"
										/>
									),
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
				<Button
					borderless
					className="nps-survey__close-button"
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

const mapStateToProps = ( state ) => {
	return {
		hasAnswered: hasAnsweredNpsSurvey( state ),
		hasAvailableConciergeSession: isAvailableForConciergeSession( state ),
	};
};

export default connect( mapStateToProps, {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
	successNotice,
	recordTracksEventAction,
} )( localize( NpsSurvey ) );
