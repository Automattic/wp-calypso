/**
 * External dependencies
 */
import React from 'react';
import shuffle from 'lodash/shuffle';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordTracksEvent } from 'state/analytics/actions';
import Button from 'components/button';

const CancelPurchaseForm = React.createClass( {
	propTypes: {
		productName: React.PropTypes.string.isRequired,
		translate: React.PropTypes.func,
		surveyStep: React.PropTypes.number.isRequired,
		finalStep: React.PropTypes.number.isRequired,
		showSurvey: React.PropTypes.bool.isRequired,
		defaultContent: React.PropTypes.node.isRequired,
		onInputChange: React.PropTypes.func.isRequired,
		isJetpack: React.PropTypes.bool.isRequired
	},

	getInitialState() {
		// shuffle reason order, but keep anotherReasonOne last
		let questionOneOrder = shuffle( [
			'couldNotInstall',
			'tooHard',
			'didNotInclude',
			'onlyNeedFree'
		] );

		let questionTwoOrder = shuffle( [
			'stayingHere',
			'otherWordPress',
			'differentService',
			'noNeed'
		] );

		// set different reason groupings for Jetpack subscribers
		if ( this.props.isJetpack ) {
			questionOneOrder = shuffle( [
				'couldNotActivate',
				'didNotInclude',
				'onlyNeedFree'
			] );

			questionTwoOrder = shuffle( [
				'stayingHere',
				'otherPlugin',
				'leavingWP',
				'noNeed'
			] );
		}

		questionOneOrder.push( 'anotherReasonOne' );
		questionTwoOrder.push( 'anotherReasonTwo' );

		return {
			questionOneRadio: null,
			questionOneText: '',
			questionOneOrder: questionOneOrder,
			questionTwoRadio: null,
			questionTwoText: '',
			questionTwoOrder: questionTwoOrder,
			questionThreeText: ''
		};
	},

	onRadioOneChange( event ) {
		this.props.clickRadio( 'radio_1', event.currentTarget.value );
		const newState = {
			...this.state,
			questionOneRadio: event.currentTarget.value,
			questionOneText: ''
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	},

	onTextOneChange( event ) {
		const newState = {
			...this.state,
			questionOneText: event.currentTarget.value
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	},

	onRadioTwoChange( event ) {
		this.props.clickRadio( 'radio_2', event.currentTarget.value );
		const newState = {
			...this.state,
			questionTwoRadio: event.currentTarget.value,
			questionTwoText: ''
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	},

	onTextTwoChange( event ) {
		const newState = {
			...this.state,
			questionTwoText: event.currentTarget.value
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	},

	onTextThreeChange( event ) {
		const newState = {
			...this.state,
			questionThreeText: event.currentTarget.value
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	},

	renderQuestionOne() {
		const reasons = {};
		const { translate } = this.props;

		const couldNotInstallInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="couldNotInstallInput"
				id="couldNotInstallInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ translate( 'What plugin/theme were you trying to install?' ) } />
		);
		reasons.couldNotInstall = (
			<FormLabel key="couldNotInstall">
				<FormRadio
					name="couldNotInstall"
					value="couldNotInstall"
					checked={ 'couldNotInstall' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'I couldn\'t install a plugin/theme I wanted.' ) }</span>
				{ 'couldNotInstall' === this.state.questionOneRadio && couldNotInstallInput }
			</FormLabel>
		);

		const tooHardInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="tooHardInput"
				id="tooHardInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ translate( 'Where did you run into problems?' ) } />
		);
		reasons.tooHard = (
			<FormLabel key="tooHard">
				<FormRadio
					name="tooHard"
					value="tooHard"
					checked={ 'tooHard' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'It was too hard to set up my site.' ) }</span>
				{ 'tooHard' === this.state.questionOneRadio && tooHardInput }
			</FormLabel>
		);

		const didNotIncludeInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="didNotIncludeInput"
				id="didNotIncludeInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ translate( 'What are we missing that you need?' ) } />
		);
		reasons.didNotInclude = (
			<FormLabel key="didNotInclude">
				<FormRadio
					name="didNotInclude"
					value="didNotInclude"
					checked={ 'didNotInclude' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'This upgrade didn\'t include what I needed.' ) }</span>
				{ 'didNotInclude' === this.state.questionOneRadio && didNotIncludeInput }
			</FormLabel>
		);

		const onlyNeedFreeInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="onlyNeedFreeInput"
				id="onlyNeedFreeInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ translate( 'How can we improve our upgrades?' ) } />
		);
		reasons.onlyNeedFree = (
			<FormLabel key="onlyNeedFree">
				<FormRadio
					name="onlyNeedFree"
					value="onlyNeedFree"
					checked={ 'onlyNeedFree' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'The plan was too expensive.' ) }</span>
				{ 'onlyNeedFree' === this.state.questionOneRadio && onlyNeedFreeInput }
			</FormLabel>
		);

		const anotherReasonOneInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="anotherReasonOneInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				id="anotherReasonOneInput" />
		);
		reasons.anotherReasonOne = (
			<FormLabel key="anotherReasonOne">
				<FormRadio
					name="anotherReasonOne"
					value="anotherReasonOne"
					checked={ 'anotherReasonOne' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'Another reason…' ) }</span>
				{ 'anotherReasonOne' === this.state.questionOneRadio && anotherReasonOneInput }
			</FormLabel>
		);

		// Survey questions only for Jetpack subscriptions
		const couldNotActivateInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="couldNotActivateInput"
				id="couldNotActivateInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ translate( 'Where did you run into problems?' ) } />
		);
		reasons.couldNotActivate = (
			<FormLabel key="couldNotActivate">
				<FormRadio
					name="couldNotActivate"
					value="couldNotActivate"
					checked={ 'couldNotActivate' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ translate( 'I was unable to activate or use the product.' ) }</span>
				{ 'couldNotActivate' === this.state.questionOneRadio && couldNotActivateInput }
			</FormLabel>
		);

		const { questionOneOrder } = this.state,
			orderedReasons = questionOneOrder.map( question => reasons[ question ] );

		return (
			<div>
				<FormLegend>{ translate( 'Please tell us why you are canceling:' ) }</FormLegend>
				{ orderedReasons }
			</div>
		);
	},

	renderQuestionTwo() {
		const reasons = {};
		const { translate } = this.props;

		reasons.stayingHere = (
			<FormLabel key="stayingHere">
				<FormRadio
					name="stayingHere"
					value="stayingHere"
					checked={ 'stayingHere' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I\'m staying here and using the free plan.' ) }</span>
			</FormLabel>
		);

		const otherWordPressInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="otherWordPressInput"
				id="otherWordPressInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ translate( 'Mind telling us where?' ) } />
		);
		reasons.otherWordPress = (
			<FormLabel key="otherWordPress">
				<FormRadio
					name="otherWordPress"
					value="otherWordPress"
					checked={ 'otherWordPress' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I\'m going to use WordPress somewhere else.' ) }</span>
				{ 'otherWordPress' === this.state.questionTwoRadio && otherWordPressInput }
			</FormLabel>
		);

		const differentServiceInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="differentServiceInput"
				id="differentServiceInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ translate( 'Mind telling us which one?' ) } />
		);
		reasons.differentService = (
			<FormLabel key="differentService">
				<FormRadio
					name="differentService"
					value="differentService"
					checked={ 'differentService' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I\'m going to use a different service for my website or blog.' ) }</span>
				{ 'differentService' === this.state.questionTwoRadio && differentServiceInput }
			</FormLabel>
		);

		const noNeedInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="noNeedInput"
				id="noNeedInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ translate( 'What will you do instead?' ) } />
		);
		reasons.noNeed = (
			<FormLabel key="noNeed">
				<FormRadio
					name="noNeed"
					value="noNeed"
					checked={ 'noNeed' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I no longer need a website or blog.' ) }</span>
				{ 'noNeed' === this.state.questionTwoRadio && noNeedInput }
			</FormLabel>
		);

		const anotherReasonTwoInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="anotherReasonTwoInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				id="anotherReasonTwoInput" />
		);
		reasons.anotherReasonTwo = (
			<FormLabel key="anotherReasonTwo">
				<FormRadio
					name="anotherReasonTwo"
					value="anotherReasonTwo"
					checked={ 'anotherReasonTwo' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'Another reason…' ) }</span>
				{ 'anotherReasonTwo' === this.state.questionTwoRadio && anotherReasonTwoInput }
			</FormLabel>
		);

		// Survey questions only for Jetpack subscriptions
		const otherPluginInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="otherPluginInput"
				id="otherPluginInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ translate( 'Mind telling us which one(s)?' ) } />
		);
		reasons.otherPlugin = (
			<FormLabel key="otherPlugin">
				<FormRadio
					name="otherPlugin"
					value="otherPlugin"
					checked={ 'otherPlugin' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I found a better plugin or service.' ) }</span>
				{ 'otherPlugin' === this.state.questionTwoRadio && otherPluginInput }
			</FormLabel>
		);

		const leavingWPInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="leavingWPInput"
				id="leavingWPInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ translate( 'Any particular reason(s)?' ) } />
		);
		reasons.leavingWP = (
			<FormLabel key="leavingWP">
				<FormRadio
					name="leavingWP"
					value="leavingWP"
					checked={ 'leavingWP' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ translate( 'I\'m moving my site off of WordPress.' ) }</span>
				{ 'leavingWP' === this.state.questionTwoRadio && leavingWPInput }
			</FormLabel>
		);

		const { questionTwoOrder } = this.state,
			orderedReasons = questionTwoOrder.map( question => reasons[ question ] );

		return (
			<div>
				<FormLegend>{ translate( 'Where is your next adventure taking you?' ) }</FormLegend>
				{ orderedReasons }
			</div>
		);
	},

	renderFreeformQuestion() {
		const { translate } = this.props;
		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'What\'s one thing we could have done better? (optional)' ) }
					<FormTextarea
						name="improvementInput"
						id="improvementInput"
						value={ this.state.questionThreeText }
						onChange={ this.onTextThreeChange } />
				</FormLabel>
			</FormFieldset>
		);
	},

	openCalendly() {
		this.props.clickCalendly();
		return window.open( 'https://calendly.com/wordpressdotcom/wordpress-com-business-site-setup/' );
	},

	renderConciergeOffer() {
		const { translate } = this.props;
		return (
			<FormFieldset>
				<p>
					{
						translate(
							'Schedule a 30 minute orientation with one of our Happiness Engineers. ' +
							'We\'ll help you to setup your site and answer any questions you have!'
						)
					}
				</p>
				<Button
					onClick={ this.openCalendly }
					primary
				>
					{ translate( 'Schedule a session' ) }
				</Button>
			</FormFieldset>
		);
	},

	openChat() {
	},

	renderLiveChat() {
		const { productName, translate } = this.props;
		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'How can we help?' ) }
				</FormLabel>
				<p>
					{
						translate(
							'As a %(productName)s user, you have instant access to our team of Happiness ' +
							'Engineers who can answer your questions and get your site up and running ' +
							'just as you like! Click the button below to start a chat now.',
							{
								args: { productName }
							}
						)
					}
				</p>
				<Button
					onClick={ this.openChat }
					primary
				>
					{ translate( 'Schedule a session' ) }
				</Button>
			</FormFieldset>
		);
	},

	render() {
		const { translate } = this.props;
		if ( this.props.showSurvey ) {
			if ( this.props.surveyStep === 1 ) {
				return (
					<div>
						<FormSectionHeading>
							{ translate( 'Your thoughts are needed.' ) }
						</FormSectionHeading>
						<p>
							{ translate( 'Before you go, please answer a few quick questions to help us improve WordPress.com.' ) }
						</p>
						{ this.renderQuestionOne() }
						{ this.renderQuestionTwo() }
					</div>
				);
			}

			// Render concierge offer if appropriate
			if ( this.props.surveyStep === 2 && this.props.finalStep === 3 ) {
				return (
					<div>
						<FormSectionHeading>
							{ translate( 'Let us help you setup your site!' ) }
						</FormSectionHeading>
						{ this.renderConciergeOffer() }
					</div>
				);
			}

			// Render cancellation step
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
		return ( <div>{ this.props.defaultContent }</div> );
	}
} );

export default connect(
	null,
	( dispatch ) => ( {
		clickRadio: ( option, value ) => dispatch( recordTracksEvent(
			'calypso_purchases_cancel_form_select_radio_option', {
				option: option,
				value: value
			}
		) ),
		clickCalendly: () => dispatch( recordTracksEvent(
			'calypso_purchases_cancel_form_concierge_click'
		) ),
	} )
)( localize( CancelPurchaseForm ) );
