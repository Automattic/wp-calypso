/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import shuffle from 'lodash/shuffle';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'lib/purchases';
import { getPurchase, isDataLoading } from '../utils';
import Gridicon from 'components/gridicon';
import { isDomainRegistration, isPlan, isGoogleApps } from 'lib/products-values';
import notices from 'notices';
import purchasePaths from '../paths';
import { removePurchase } from 'lib/upgrades/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';

/**
 * Module dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:purchases:survey' );

const RemovePurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] ),
		user: React.PropTypes.object.isRequired
	},

	getInitialState() {
		// shuffle reason order, but keep anotherReasonOne last
		const questionOneOrder = shuffle( [
			'couldNotInstall',
			'tooHard',
			'didNotInclude',
			'onlyNeedFree'
		] );
		questionOneOrder.push( 'anotherReasonOne' );

		const questionTwoOrder = shuffle( [
			'stayingHere',
			'otherWordPress',
			'differentService',
			'noNeed'
		] );
		questionTwoOrder.push( 'anotherReasonTwo' );

		return {
			isDialogVisible: false,
			isRemoving: false,
			surveyStep: 1,
			questionOneRadio: null,
			questionOneText: '',
			questionOneOrder: questionOneOrder,
			questionTwoRadio: null,
			questionTwoText: '',
			questionTwoOrder: questionTwoOrder,
			questionThreeText: ''
		};
	},

	closeDialog() {
		this.setState( { isDialogVisible: false } );
	},

	openDialog( event ) {
		event.preventDefault();

		this.setState( { isDialogVisible: true } );
	},

	changeSurveyStep() {
		this.setState( {
			surveyStep: this.state.surveyStep === 1 ? 2 : 1,
		} );
	},

	removePurchase( closeDialog ) {
		this.setState( { isRemoving: true } );

		const purchase = getPurchase( this.props ),
			{ selectedSite, user } = this.props;

		if ( ! isDomainRegistration( purchase ) && config.isEnabled( 'upgrades/removal-survey' ) ) {
			const survey = wpcom.marketing().survey( 'calypso-remove-purchase', this.props.selectedSite.ID );
			survey.addResponses( {
				'why-cancel': {
					response: this.state.questionOneRadio,
					text: this.state.questionOneText
				},
				'next-adventure': {
					response: this.state.questionTwoRadio,
					text: this.state.questionTwoText
				},
				'what-better': { text: this.state.questionThreeText }
			} );

			debug( 'Survey responses', survey );
			survey.submit()
				.then( res => {
					debug( 'Survey submit response', res );
					if ( ! res.success ) {
						notices.error( res.err );
					}
				} )
				.catch( err => debug( err ) ); // shouldn't get here
		}

		removePurchase( purchase.id, user.ID, success => {
			if ( success ) {
				const productName = getName( purchase );

				if ( isDomainRegistration( purchase ) ) {
					notices.success(
						this.translate( 'The domain {{domain/}} was removed from your account.', {
							components: { domain: <em>{ productName }</em> }
						} ),
						{ persistent: true }
					);
				} else {
					notices.success(
						this.translate( '%(productName)s was removed from {{siteName/}}.', {
							args: { productName },
							components: { siteName: <em>{ selectedSite.slug }</em> }
						} ),
						{ persistent: true }
					);
				}

				page( purchasePaths.list() );
			} else {
				this.setState( { isRemoving: false } );

				closeDialog();

				notices.error( this.props.selectedPurchase.error );
			}
		} );
	},

	handleRadioOne( event ) {
		this.setState( {
			questionOneRadio: event.currentTarget.value,
			questionOneText: ''
		} );
	},

	handleTextOne( event ) {
		this.setState( {
			questionOneText: event.currentTarget.value
		} );
	},

	handleRadioTwo( event ) {
		this.setState( {
			questionTwoRadio: event.currentTarget.value,
			questionTwoText: ''
		} );
	},

	handleTextTwo( event ) {
		this.setState( {
			questionTwoText: event.currentTarget.value
		} );
	},

	handleTextThree( event ) {
		this.setState( {
			questionThreeText: event.currentTarget.value
		} );
	},

	renderCard() {
		const productName = getName( getPurchase( this.props ) );

		return (
			<CompactCard className="remove-purchase__card" onClick={ this.openDialog }>
				<a href="#">
					<Gridicon icon="trash" />
					{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }
				</a>
			</CompactCard>
		);
	},

	renderDomainDialog() {
		const buttons = [ {
				action: 'cancel',
				disabled: this.state.isRemoving,
				label: this.translate( 'Cancel' )
			},
			{
				action: 'remove',
				disabled: this.state.isRemoving,
				isPrimary: true,
				label: this.translate( 'Remove Now' ),
				onClick: this.removePurchase
			} ],
			productName = getName( getPurchase( this.props ) );

		return (
			<Dialog
				buttons={ buttons }
				className="remove-purchase__dialog"
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }>
				<FormSectionHeading>{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }</FormSectionHeading>
				{ this.renderDomainDialogText() }
			</Dialog>
		);
	},

	renderDomainDialogText() {
		const purchase = getPurchase( this.props ),
			productName = getName( purchase );

		return (
			<p>
				{
					this.translate(
						'This will remove %(domain)s from your account. By removing, ' +
							'you are canceling the domain registration. This may stop ' +
							'you from using it again, even with another service.',
						{ args: { domain: productName } }
					)
				}
			</p>
		);
	},

	renderPlanDialogs() {
		const buttons = {
				cancel: {
					action: 'cancel',
					disabled: this.state.isRemoving,
					label: this.translate( 'Cancel' )
				},
				next: {
					action: 'next',
					disabled: this.state.isRemoving ||
						this.state.questionOneRadio === null ||
						this.state.questionTwoRadio === null ||
						( this.state.questionOneRadio === 'anotherReasonOne' && this.state.questionOneText === '' ) ||
						( this.state.questionTwoRadio === 'anotherReasonTwo' && this.state.questionTwoText === '' ),
					label: this.translate( 'Next' ),
					onClick: this.changeSurveyStep
				},
				prev: {
					action: 'prev',
					disabled: this.state.isRemoving,
					label: this.translate( 'Previous' ),
					onClick: this.changeSurveyStep
				},
				remove: {
					action: 'remove',
					disabled: this.state.isRemoving,
					isPrimary: true,
					label: this.translate( 'Remove' ),
					onClick: this.removePurchase
				}
			},
			productName = getName( getPurchase( this.props ) ),
			inStepOne = this.state.surveyStep === 1;

		let buttonsArr, dialogContent;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.cancel, buttons.remove ];
			dialogContent = this.renderPlanDialogsText();
		} else {
			buttonsArr = ( inStepOne ) ? [ buttons.cancel, buttons.next ] : [ buttons.cancel, buttons.prev, buttons.remove ];
			dialogContent = ( inStepOne ) ? this.renderDialogContentOne() : this.renderDialogContentTwo();
		}

		return (
			<div>
				<Dialog
					buttons={ buttonsArr }
					className="remove-purchase__dialog"
					isVisible={ this.state.isDialogVisible }
					onClose={ this.closeDialog }>
					<FormSectionHeading>{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }</FormSectionHeading>
					{ dialogContent }
				</Dialog>
			</div>
		);
	},

	renderPlanDialogsText() {
		const purchase = getPurchase( this.props ),
			productName = getName( purchase ),
			includedDomainText = (
				<p>
					{
						this.translate(
							'The domain associated with this plan, {{domain/}}, will not be removed. ' +
								'It will remain active on your site, unless also removed.',
							{ components: { domain: <em>{ getIncludedDomain( purchase ) }</em> } }
						)
					}
				</p>
			);

		return (
			<div>
				<p>
					{
						this.translate(
							'Are you sure you want to remove %(productName)s from {{siteName/}}?',
							{
								args: { productName },
								components: { siteName: <em>{ this.props.selectedSite.slug }</em> }
							}
						)
					}
					{ ' ' }
					{ isGoogleApps( purchase )
						? this.translate(
							'Your Google Apps account will continue working without interruption. ' +
								'You will be able to manage your Google Apps billing directly through Google.'
						)
						: this.translate(
							'You will not be able to reuse it again without purchasing a new subscription.',
							{ comment: "'it' refers to a product purchased by a user" }
						)
					}

				</p>

				{ ( isPlan( purchase ) && hasIncludedDomain( purchase ) ) && includedDomainText }
			</div>
		);
	},

	renderQuestionOne() {
		const reasons = {};

		const couldNotInstallInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="couldNotInstallInput"
				id="couldNotInstallInput"
				value={ this.state.questionOneText }
				onChange={ this.handleTextOne }
				placeholder={ this.translate( 'What plugin/theme were you trying to install?' ) } />
		);
		reasons.couldNotInstall = (
			<FormLabel key="couldNotInstall">
				<FormRadio
					name="couldNotInstall"
					value="couldNotInstall"
					checked={ 'couldNotInstall' === this.state.questionOneRadio }
					onChange={ this.handleRadioOne } />
				<span>{ this.translate( 'I couldn\'t install a plugin/theme I wanted.' ) }</span>
				{ 'couldNotInstall' === this.state.questionOneRadio && couldNotInstallInput }
			</FormLabel>
		);

		const tooHardInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="tooHardInput"
				id="tooHardInput"
				value={ this.state.questionOneText }
				onChange={ this.handleTextOne }
				placeholder={ this.translate( 'Where did you run into problems?' ) } />
		);
		reasons.tooHard = (
			<FormLabel key="tooHard">
				<FormRadio
					name="tooHard"
					value="tooHard"
					checked={ 'tooHard' === this.state.questionOneRadio }
					onChange={ this.handleRadioOne } />
				<span>{ this.translate( 'It was too hard to set up my site.' ) }</span>
				{ 'tooHard' === this.state.questionOneRadio && tooHardInput }
			</FormLabel>
		);

		const didNotIncludeInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="didNotIncludeInput"
				id="didNotIncludeInput"
				value={ this.state.questionOneText }
				onChange={ this.handleTextOne }
				placeholder={ this.translate( 'What are we missing that you need?' ) } />
		);
		reasons.didNotInclude = (
			<FormLabel key="didNotInclude">
				<FormRadio
					name="didNotInclude"
					value="didNotInclude"
					checked={ 'didNotInclude' === this.state.questionOneRadio }
					onChange={ this.handleRadioOne } />
				<span>{ this.translate( 'This upgrade didn\'t include what I needed.' ) }</span>
				{ 'didNotInclude' === this.state.questionOneRadio && didNotIncludeInput }
			</FormLabel>
		);

		const onlyNeedFreeInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="onlyNeedFreeInput"
				id="onlyNeedFreeInput"
				value={ this.state.questionOneText }
				onChange={ this.handleTextOne }
				placeholder={ this.translate( 'How can we improve our upgrades?' ) } />
		);
		reasons.onlyNeedFree = (
			<FormLabel key="onlyNeedFree">
				<FormRadio
					name="onlyNeedFree"
					value="onlyNeedFree"
					checked={ 'onlyNeedFree' === this.state.questionOneRadio }
					onChange={ this.handleRadioOne } />
				<span>{ this.translate( 'All I need is the free plan.' ) }</span>
				{ 'onlyNeedFree' === this.state.questionOneRadio && onlyNeedFreeInput }
			</FormLabel>
		);

		const anotherReasonOneInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="anotherReasonOneInput"
				value={ this.state.questionOneText }
				onChange={ this.handleTextOne }
				id="anotherReasonOneInput" />
		);
		reasons.anotherReasonOne = (
			<FormLabel key="anotherReasonOne">
				<FormRadio
					name="anotherReasonOne"
					value="anotherReasonOne"
					checked={ 'anotherReasonOne' === this.state.questionOneRadio }
					onChange={ this.handleRadioOne } />
				<span>{ this.translate( 'Another reason…' ) }</span>
				{ 'anotherReasonOne' === this.state.questionOneRadio && anotherReasonOneInput }
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
					onChange={ this.handleRadioTwo } />
				<span>{ this.translate( 'I\'m staying here and using the free plan.' ) }</span>
			</FormLabel>
		);

		const otherWordPressInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="otherWordPressInput"
				id="otherWordPressInput"
				value={ this.state.questionTwoText }
				onChange={ this.handleTextTwo }
				placeholder={ this.translate( 'Mind telling us where?' ) } />
		);
		reasons.otherWordPress = (
			<FormLabel key="otherWordPress">
				<FormRadio
					name="otherWordPress"
					value="otherWordPress"
					checked={ 'otherWordPress' === this.state.questionTwoRadio }
					onChange={ this.handleRadioTwo } />
				<span>{ this.translate( 'I\'m going to use WordPress somewhere else.' ) }</span>
				{ 'otherWordPress' === this.state.questionTwoRadio && otherWordPressInput }
			</FormLabel>
		);

		const differentServiceInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="differentServiceInput"
				id="differentServiceInput"
				value={ this.state.questionTwoText }
				onChange={ this.handleTextTwo }
				placeholder={ this.translate( 'Mind telling us which one?' ) } />
		);
		reasons.differentService = (
			<FormLabel key="differentService">
				<FormRadio
					name="differentService"
					value="differentService"
					checked={ 'differentService' === this.state.questionTwoRadio }
					onChange={ this.handleRadioTwo } />
				<span>{ this.translate( 'I\'m going to use a different service for my website or blog.' ) }</span>
				{ 'differentService' === this.state.questionTwoRadio && differentServiceInput }
			</FormLabel>
		);

		const noNeedInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="noNeedInput"
				id="noNeedInput"
				value={ this.state.questionTwoText }
				onChange={ this.handleTextTwo }
				placeholder={ this.translate( 'What will you do instead?' ) } />
		);
		reasons.noNeed = (
			<FormLabel key="noNeed">
				<FormRadio
					name="noNeed"
					value="noNeed"
					checked={ 'noNeed' === this.state.questionTwoRadio }
					onChange={ this.handleRadioTwo } />
				<span>{ this.translate( 'I no longer need a website or blog.' ) }</span>
				{ 'noNeed' === this.state.questionTwoRadio && noNeedInput }
			</FormLabel>
		);

		const anotherReasonTwoInput = (
			<FormTextInput
				className="remove-purchase__reason-input"
				name="anotherReasonTwoInput"
				value={ this.state.questionTwoText }
				onChange={ this.handleTextTwo }
				id="anotherReasonTwoInput" />
		);
		reasons.anotherReasonTwo = (
			<FormLabel key="anotherReasonTwo">
				<FormRadio
					name="anotherReasonTwo"
					value="anotherReasonTwo"
					checked={ 'anotherReasonTwo' === this.state.questionTwoRadio }
					onChange={ this.handleRadioTwo } />
				<span>{ this.translate( 'Another reason…' ) }</span>
				{ 'anotherReasonTwo' === this.state.questionTwoRadio && anotherReasonTwoInput }
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
						onChange={ this.handleTextThree } />
				</FormLabel>
			</FormFieldset>
		);
	},

	renderDialogContentOne() {
		return (
			<div>
				{ this.renderQuestionOne() }
				{ this.renderQuestionTwo() }
			</div>
		);
	},

	renderDialogContentTwo() {
		return (
			<div>
				{ this.renderFreeformQuestion() }
				{ this.renderPlanDialogsText() }
			</div>
		);
	},

	render() {
		if ( isDataLoading( this.props ) || ! this.props.selectedSite ) {
			return null;
		}

		const purchase = getPurchase( this.props );
		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		return (
			<span>
				{ this.renderCard() }
				{ isDomainRegistration( purchase ) ? this.renderDomainDialog() : this.renderPlanDialogs() }
			</span>
		);
	}
} );

export default RemovePurchase;
