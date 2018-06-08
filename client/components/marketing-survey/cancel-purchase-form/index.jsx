/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { shuffle } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordTracksEvent } from 'state/analytics/actions';
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import * as steps from './steps';
import BusinessATStep from './step-components/business-at-step';
import UpgradeATStep from './step-components/upgrade-at-step';
import { getName } from 'lib/purchases';
import { radioOption } from './radio-option';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './options-for-product';

class CancelPurchaseForm extends React.Component {
	static propTypes = {
		chatInitiated: PropTypes.func.isRequired,
		defaultContent: PropTypes.node.isRequired,
		onInputChange: PropTypes.func.isRequired,
		purchase: PropTypes.object.isRequired,
		showSurvey: PropTypes.bool.isRequired,
		siteSlug: PropTypes.string.isRequired,
		surveyStep: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		const { purchase } = props;
		const questionOneOrder = shuffle( cancellationOptionsForPurchase( purchase ) );
		const questionTwoOrder = shuffle( nextAdventureOptionsForPurchase( purchase ) );

		questionOneOrder.push( 'anotherReasonOne' );

		if ( questionTwoOrder.length > 0 ) {
			questionTwoOrder.push( 'anotherReasonTwo' );
		}

		this.state = {
			questionOneRadio: null,
			questionOneText: '',
			questionOneOrder: questionOneOrder,
			questionTwoRadio: null,
			questionTwoText: '',
			questionTwoOrder: questionTwoOrder,
			questionThreeText: '',
		};
	}

	onRadioOneChange = event => {
		this.props.clickRadio( 'radio_1', event.currentTarget.value );
		const newState = {
			...this.state,
			questionOneRadio: event.currentTarget.value,
			questionOneText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextOneChange = event => {
		const newState = {
			...this.state,
			questionOneText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onRadioTwoChange = event => {
		this.props.clickRadio( 'radio_2', event.currentTarget.value );
		const newState = {
			...this.state,
			questionTwoRadio: event.currentTarget.value,
			questionTwoText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextTwoChange = event => {
		const newState = {
			...this.state,
			questionTwoText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextThreeChange = event => {
		const newState = {
			...this.state,
			questionThreeText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	renderQuestionOne = () => {
		const reasons = {};
		const { translate } = this.props;
		const { questionOneOrder, questionOneRadio, questionOneText } = this.state;

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			( reasons[ key ] = radioOption(
				key,
				questionOneRadio,
				questionOneText,
				this.onRadioOneChange,
				this.onTextOneChange,
				radioPrompt,
				textPlaceholder
			) );

		appendRadioOption(
			'couldNotInstall',
			translate( "I couldn't install a plugin/theme I wanted." ),
			translate( 'What plugin/theme were you trying to install?' )
		);

		appendRadioOption(
			'tooHard',
			translate( 'It was too hard to set up my site.' ),
			translate( 'Where did you run into problems?' )
		);

		appendRadioOption(
			'didNotInclude',
			translate( "This upgrade didn't include what I needed." ),
			translate( 'What are we missing that you need?' )
		);

		appendRadioOption(
			'onlyNeedFree',
			translate( 'The plan was too expensive.' ),
			translate( 'How can we improve our upgrades?' )
		);

		appendRadioOption(
			'couldNotActivate',
			translate( 'I was unable to activate or use the product.' ),
			translate( 'Where did you run into problems?' )
		);

		appendRadioOption(
			'noLongerWantToTransfer',
			translate( 'I no longer want to transfer my domain.' )
		);

		appendRadioOption(
			'couldNotCompleteTransfer',
			translate( 'Something went wrong and I could not complete the transfer.' )
		);

		appendRadioOption(
			'useDomainWithoutTransferring',
			translate( 'I’m going to use my domain with WordPress.com without transferring it.' )
		);

		appendRadioOption( 'anotherReasonOne', translate( 'Another reason…' ), ' ' );

		return (
			<div>
				<FormLegend>{ translate( 'Please tell us why you are canceling:' ) }</FormLegend>
				{ questionOneOrder.map( question => reasons[ question ] ) }
			</div>
		);
	};

	renderQuestionTwo = () => {
		const reasons = {};
		const { translate } = this.props;
		const { questionTwoOrder, questionTwoRadio, questionTwoText } = this.state;

		if ( questionTwoOrder.length === 0 ) {
			return null;
		}

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			( reasons[ key ] = radioOption(
				key,
				questionTwoRadio,
				questionTwoText,
				this.onRadioTwoChange,
				this.onTextTwoChange,
				radioPrompt,
				textPlaceholder
			) );

		appendRadioOption( 'stayingHere', translate( "I'm staying here and using the free plan." ) );

		appendRadioOption(
			'otherWordPress',
			translate( "I'm going to use WordPress somewhere else." ),
			translate( 'Mind telling us where?' )
		);

		appendRadioOption(
			'differentService',
			translate( "I'm going to use a different service for my website or blog." ),
			translate( 'Mind telling us which one?' )
		);

		appendRadioOption(
			'noNeed',
			translate( 'I no longer need a website or blog.' ),
			translate( 'What will you do instead?' )
		);

		appendRadioOption(
			'otherPlugin',
			translate( 'I found a better plugin or service.' ),
			translate( 'Mind telling us which one(s)?' )
		);

		appendRadioOption(
			'leavingWP',
			translate( "I'm moving my site off of WordPress." ),
			translate( 'Any particular reason(s)?' )
		);

		appendRadioOption( 'anotherReasonTwo', translate( 'Another reason…' ), ' ' );

		return (
			<div>
				<FormLegend>{ translate( 'Where is your next adventure taking you?' ) }</FormLegend>
				{ questionTwoOrder.map( question => reasons[ question ] ) }
			</div>
		);
	};

	renderFreeformQuestion = () => {
		const { translate } = this.props;
		return (
			<FormFieldset>
				<FormLabel>
					{ translate( "What's one thing we could have done better? (optional)" ) }
					<FormTextarea
						name="improvementInput"
						id="improvementInput"
						value={ this.state.questionThreeText }
						onChange={ this.onTextThreeChange }
					/>
				</FormLabel>
			</FormFieldset>
		);
	};

	openConcierge = () => {
		this.props.clickConcierge();
		return window.open( `/me/concierge/${ this.props.siteSlug }/book` );
	};

	renderConciergeOffer = () => {
		const { translate } = this.props;
		return (
			<FormFieldset>
				<p>
					{ translate(
						'Schedule a 30 minute orientation with one of our Happiness Engineers. ' +
							"We'll help you to setup your site and answer any questions you have!"
					) }
				</p>
				<Button onClick={ this.openConcierge } primary>
					{ translate( 'Schedule a session' ) }
				</Button>
			</FormFieldset>
		);
	};

	renderLiveChat = () => {
		const { chatInitiated, purchase, translate } = this.props;
		const productName = getName( purchase );
		return (
			<FormFieldset>
				<p>
					{ translate(
						'As a %(productName)s user, you have instant access to our team of Happiness ' +
							'Engineers who can answer your questions and get your site up and running ' +
							'just as you like! Click the button below to start a chat now.',
						{
							args: { productName },
						}
					) }
				</p>
				<HappychatButton primary borderless={ false } onClick={ chatInitiated }>
					{ translate( 'Start a Live chat' ) }
				</HappychatButton>
			</FormFieldset>
		);
	};

	render() {
		const { translate, showSurvey, surveyStep } = this.props;
		if ( showSurvey ) {
			if ( surveyStep === steps.INITIAL_STEP ) {
				return (
					<div>
						<FormSectionHeading>{ translate( 'Your thoughts are needed.' ) }</FormSectionHeading>
						<p>
							{ translate(
								'Before you go, please answer a few quick questions to help us improve WordPress.com.'
							) }
						</p>
						{ this.renderQuestionOne() }
						{ this.renderQuestionTwo() }
					</div>
				);
			}

			if ( surveyStep === steps.CONCIERGE_STEP ) {
				return (
					<div>
						<FormSectionHeading>
							{ translate( 'Let us help you setup your site!' ) }
						</FormSectionHeading>
						{ this.renderConciergeOffer() }
					</div>
				);
			}

			if ( surveyStep === steps.HAPPYCHAT_STEP ) {
				return (
					<div>
						<FormSectionHeading>{ translate( 'How can we help?' ) }</FormSectionHeading>
						{ this.renderLiveChat() }
					</div>
				);
			}

			if ( surveyStep === steps.BUSINESS_AT_STEP ) {
				return <BusinessATStep />;
			}

			if ( surveyStep === steps.UPGRADE_AT_STEP ) {
				return <UpgradeATStep />;
			}

			return (
				<div>
					<FormSectionHeading>
						{ translate( 'One more question before you go.' ) }
					</FormSectionHeading>
					{ this.renderFreeformQuestion() }
					{ this.props.defaultContent }
				</div>
			);
		}

		// just return the default if we don't want to show the survey
		return <div>{ this.props.defaultContent }</div>;
	}
}

export default connect( null, dispatch => ( {
	clickRadio: ( option, value ) =>
		dispatch(
			recordTracksEvent( 'calypso_purchases_cancel_form_select_radio_option', {
				option: option,
				value: value,
			} )
		),
	clickConcierge: () =>
		dispatch( recordTracksEvent( 'calypso_purchases_cancel_form_concierge_click' ) ),
} ) )( localize( CancelPurchaseForm ) );
