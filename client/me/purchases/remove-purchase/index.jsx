/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'lib/purchases';
import { getPurchase, isDataLoading } from '../utils';
import Gridicon from 'components/gridicon';
import { isDomainRegistration, isPlan, isGoogleApps } from 'lib/products-values';
import notices from 'notices';
import purchasePaths from '../paths';
import { removePurchase } from 'state/purchases/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import userFactory from 'lib/user';

const user = userFactory();

/**
 * Module dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:purchases:survey' );

const RemovePurchase = React.createClass( {
	propTypes: {
		hasLoadedUserPurchasesFromServer: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] )
	},

	getInitialState() {
		return {
			isDialogVisible: false,
			isRemoving: false,
			surveyStep: 1,
			survey: {
				questionOneRadio: null,
				questionTwoRadio: null
			}
		};
	},

	closeDialog() {
		this.setState( {
			isDialogVisible: false,
			surveyStep: 1,
			survey: {
				questionOneRadio: null,
				questionTwoRadio: null
			}
		} );
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

	onSurveyChange( update ) {
		this.setState( {
			survey: update,
		} );
	},

	removePurchase( closeDialog ) {
		this.setState( { isRemoving: true } );

		const purchase = getPurchase( this.props ),
			{ selectedSite } = this.props;

		if ( ! isDomainRegistration( purchase ) && config.isEnabled( 'upgrades/removal-survey' ) ) {
			const survey = wpcom.marketing().survey( 'calypso-remove-purchase', this.props.selectedSite.ID );
			survey.addResponses( {
				'why-cancel': {
					response: this.state.survey.questionOneRadio,
					text: this.state.survey.questionOneText
				},
				'next-adventure': {
					response: this.state.survey.questionTwoRadio,
					text: this.state.survey.questionTwoText
				},
				'what-better': { text: this.state.survey.questionThreeText },
				purchase: purchase.productSlug,
				type: 'cancel'
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

		this.props.removePurchase( purchase.id, user.get().ID ).then( () => {
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
		} ).catch( () => {
			this.setState( { isRemoving: false } );

			closeDialog();

			notices.error( this.props.selectedPurchase.error );
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
						this.state.survey.questionOneRadio === null ||
						this.state.survey.questionTwoRadio === null ||
						( this.state.survey.questionOneRadio === 'anotherReasonOne' && this.state.survey.questionOneText === '' ) ||
						( this.state.survey.questionTwoRadio === 'anotherReasonTwo' && this.state.survey.questionTwoText === '' ),
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

		let buttonsArr;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.cancel, buttons.remove ];
		} else {
			buttonsArr = inStepOne ? [ buttons.cancel, buttons.next ] : [ buttons.cancel, buttons.prev, buttons.remove ];
		}

		return (
			<div>
				<Dialog
					buttons={ buttonsArr }
					className="remove-purchase__dialog"
					isVisible={ this.state.isDialogVisible }
					onClose={ this.closeDialog }>
					<FormSectionHeading>{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }</FormSectionHeading>
					<CancelPurchaseForm
						surveyStep={ this.state.surveyStep }
						showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
						defaultContent={ this.renderPlanDialogsText() }
						onInputChange={ this.onSurveyChange }
					/>
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

export default connect(
	null,
	{ removePurchase }
)( RemovePurchase );
