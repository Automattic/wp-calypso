/**
 * External dependencies
 */
import React from 'react';
import shuffle from 'lodash/shuffle';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import { recordTracksEvent } from 'state/analytics/actions';

const CancelPurchaseForm = React.createClass( {
	propTypes: {
		surveyStep: React.PropTypes.number.isRequired,
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

		const couldNotInstallInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="couldNotInstallInput"
				id="couldNotInstallInput"
				value={ this.state.questionOneText }
				onChange={ this.onTextOneChange }
				placeholder={ this.translate( 'What plugin/theme were you trying to install?' ) } />
		);
		reasons.couldNotInstall = (
			<FormLabel key="couldNotInstall">
				<FormRadio
					name="couldNotInstall"
					value="couldNotInstall"
					checked={ 'couldNotInstall' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ this.translate( 'I couldn\'t install a plugin/theme I wanted.' ) }</span>
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
				placeholder={ this.translate( 'Where did you run into problems?' ) } />
		);
		reasons.tooHard = (
			<FormLabel key="tooHard">
				<FormRadio
					name="tooHard"
					value="tooHard"
					checked={ 'tooHard' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ this.translate( 'It was too hard to set up my site.' ) }</span>
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
				placeholder={ this.translate( 'What are we missing that you need?' ) } />
		);
		reasons.didNotInclude = (
			<FormLabel key="didNotInclude">
				<FormRadio
					name="didNotInclude"
					value="didNotInclude"
					checked={ 'didNotInclude' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ this.translate( 'This upgrade didn\'t include what I needed.' ) }</span>
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
				placeholder={ this.translate( 'How can we improve our upgrades?' ) } />
		);
		reasons.onlyNeedFree = (
			<FormLabel key="onlyNeedFree">
				<FormRadio
					name="onlyNeedFree"
					value="onlyNeedFree"
					checked={ 'onlyNeedFree' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ this.translate( 'The plan was too expensive.' ) }</span>
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
				<span>{ this.translate( 'Another reason…' ) }</span>
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
				placeholder={ this.translate( 'Where did you run into problems?' ) } />
		);
		reasons.couldNotActivate = (
			<FormLabel key="couldNotActivate">
				<FormRadio
					name="couldNotActivate"
					value="couldNotActivate"
					checked={ 'couldNotActivate' === this.state.questionOneRadio }
					onChange={ this.onRadioOneChange } />
				<span>{ this.translate( 'I was unable to activate or use the product.' ) }</span>
				{ 'couldNotActivate' === this.state.questionOneRadio && couldNotActivateInput }
			</FormLabel>
		);

		const { questionOneOrder } = this.state,
			orderedReasons = questionOneOrder.map( question => reasons[ question ] );

		return (
			<div>
				<FormLegend>{ this.translate( 'Please tell us why you are canceling:' ) }</FormLegend>
				{ orderedReasons }
			</div>
		);
	},

	renderQuestionTwo() {
		const reasons = {};

		reasons.stayingHere = (
			<FormLabel key="stayingHere">
				<FormRadio
					name="stayingHere"
					value="stayingHere"
					checked={ 'stayingHere' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I\'m staying here and using the free plan.' ) }</span>
			</FormLabel>
		);

		const otherWordPressInput = (
			<FormTextInput
				className="cancel-purchase-form__reason-input"
				name="otherWordPressInput"
				id="otherWordPressInput"
				value={ this.state.questionTwoText }
				onChange={ this.onTextTwoChange }
				placeholder={ this.translate( 'Mind telling us where?' ) } />
		);
		reasons.otherWordPress = (
			<FormLabel key="otherWordPress">
				<FormRadio
					name="otherWordPress"
					value="otherWordPress"
					checked={ 'otherWordPress' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I\'m going to use WordPress somewhere else.' ) }</span>
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
				placeholder={ this.translate( 'Mind telling us which one?' ) } />
		);
		reasons.differentService = (
			<FormLabel key="differentService">
				<FormRadio
					name="differentService"
					value="differentService"
					checked={ 'differentService' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I\'m going to use a different service for my website or blog.' ) }</span>
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
				placeholder={ this.translate( 'What will you do instead?' ) } />
		);
		reasons.noNeed = (
			<FormLabel key="noNeed">
				<FormRadio
					name="noNeed"
					value="noNeed"
					checked={ 'noNeed' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I no longer need a website or blog.' ) }</span>
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
				<span>{ this.translate( 'Another reason…' ) }</span>
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
				placeholder={ this.translate( 'Mind telling us which one(s)?' ) } />
		);
		reasons.otherPlugin = (
			<FormLabel key="otherPlugin">
				<FormRadio
					name="otherPlugin"
					value="otherPlugin"
					checked={ 'otherPlugin' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I found a better plugin or service.' ) }</span>
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
				placeholder={ this.translate( 'Any particular reason(s)?' ) } />
		);
		reasons.leavingWP = (
			<FormLabel key="leavingWP">
				<FormRadio
					name="leavingWP"
					value="leavingWP"
					checked={ 'leavingWP' === this.state.questionTwoRadio }
					onChange={ this.onRadioTwoChange } />
				<span>{ this.translate( 'I\'m moving my site off of WordPress.' ) }</span>
				{ 'leavingWP' === this.state.questionTwoRadio && leavingWPInput }
			</FormLabel>
		);

		const { questionTwoOrder } = this.state,
			orderedReasons = questionTwoOrder.map( question => reasons[ question ] );

		return (
			<div>
				<FormLegend>{ this.translate( 'Where is your next adventure taking you?' ) }</FormLegend>
				{ orderedReasons }
			</div>
		);
	},

	renderFreeformQuestion() {
		return (
			<FormFieldset>
				<FormLabel>
					{ this.translate( 'What\'s one thing we could have done better? (optional)' ) }
					<FormTextarea
						name="improvementInput"
						id="improvementInput"
						value={ this.state.questionThreeText }
						onChange={ this.onTextThreeChange } />
				</FormLabel>
			</FormFieldset>
		);
	},

	render() {
		if ( this.props.showSurvey ) {
			if ( this.props.surveyStep === 1 ) {
				return (
					<div>
						{ this.renderQuestionOne() }
						{ this.renderQuestionTwo() }
					</div>
				);
			}

			// 2nd surveyStep
			return (
				<div>
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
			'calypso_cancel_purchase_survey_select_radio_option', {
				option: option,
				value: value
			}
		) ),
	} )
)( CancelPurchaseForm );
