/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import cancellationReasons from './cancellation-reasons';
import { cancelAndRefundPurchase } from 'lib/upgrades/actions';
import Card from 'components/card';
import ConfirmCancelDomainLoadingPlaceholder from './loading-placeholder';
import { connect } from 'react-redux';
import FormButton from 'components/forms/form-button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormTextarea from 'components/forms/form-textarea';
import HeaderCake from 'components/header-cake';
import { isDomainRegistration } from 'lib/products-values';
import { getPurchase, goToCancelPurchase, isDataLoading, recordPageView } from '../utils';
import { getName as getDomainName } from 'lib/purchases';
import Main from 'components/main';
import notices from 'notices';
import paths from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import SelectDropdown from 'components/select-dropdown';
import titles from 'me/purchases/titles';

const ConfirmCancelDomain = React.createClass( {
	propTypes: {
		purchaseId: React.PropTypes.string.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] )
	},

	getInitialState() {
		return {
			selectedReason: null,
			message: '',
			confirmed: false,
			submitting: false
		};
	},

	componentWillMount() {
		recordPageView( 'confirm_cancel_domain', this.props );
	},

	componentDidMount() {
		this.redirectIfDataIsInvalid( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );
	},

	redirectIfDataIsInvalid( props ) {
		if ( isDataLoading( props ) || this.state.submitting ) {
			return null;
		}

		const purchase = getPurchase( props );

		if ( ! purchase || ! isDomainRegistration( purchase ) || ! props.selectedSite ) {
			page.redirect( paths.list() );
		}
	},

	isValidReasonToCancel() {
		const selectedReason = this.state.selectedReason;

		if ( ! selectedReason ) {
			return false;
		}

		return [ 'other_host', 'transfer' ].indexOf( selectedReason.value ) === -1;
	},

	goToCancelPurchase() {
		goToCancelPurchase( this.props );
	},

	onSubmit( event ) {
		event.preventDefault();

		const purchase = getPurchase( this.props ),
			purchaseName = getDomainName( purchase );

		const data = {
			domain_cancel_reason: this.state.selectedReason.value,
			domain_cancel_message: this.state.message,
			confirm: true,
			product_id: purchase.productId,
			blog_id: purchase.siteId,
			domain: purchaseName
		};

		this.setState( { submitting: true } );

		cancelAndRefundPurchase( purchase.id, data, ( error ) => {
			this.setState( { submitting: false } );

			if ( error ) {
				notices.error( error.message || this.translate( 'Unable to cancel your purchase. Please try again later or contact support.' ) );

				return;
			}

			notices.success(
				this.translate( '%(purchaseName)s was successfully cancelled and refunded.', {
					args: { purchaseName }
				} ),
				{ persistent: true }
			);

			this.props.refreshSitePlans( purchase.siteId );

			analytics.tracks.recordEvent(
				'calypso_domain_cancel_form_submit',
				{ product_slug: purchase.productSlug }
			);

			page.redirect( paths.list( this.props.selectedSite.slug ) );
		} );
	},

	onReasonChange( newReason ) {
		this.setState( { selectedReason: newReason } );
	},

	onConfirmationChange() {
		this.setState( { confirmed: ! this.state.confirmed } );
	},

	onMessageChange( event ) {
		this.setState( {
			message: event.target.value
		} );
	},

	renderHelpMessage() {
		const selectedReason = this.state.selectedReason;

		if ( ! selectedReason ) {
			return;
		}

		return (
			<div className="confirm-cancel-domain__help-message">
				<p>
					{ selectedReason.helpMessage }
				</p>
				{ selectedReason.showTextarea &&
				<FormTextarea className="confirm-cancel-domain__reason-details" onChange={ this.onMessageChange } /> }
			</div>
		);
	},

	renderConfirmationCheckbox() {
		if ( ! this.isValidReasonToCancel() ) {
			return;
		}

		return (
			<div className="confirm-cancel-domain__confirm-container">
				<FormLabel>
					<FormCheckbox checked={ this.state.confirmed } onChange={ this.onConfirmationChange } />
					<span>
						{ this.translate(
							'I understand that canceling means that I may {{strong}}lose this domain forever{{/strong}}.', {
								components: {
									strong: <strong />
								}
							}
						) }
					</span>
				</FormLabel>
			</div>
		);
	},

	renderSubmitButton() {
		if ( ! this.isValidReasonToCancel() ) {
			return;
		}

		if ( this.state.submitting ) {
			return (
				<FormButton isPrimary={ true } disabled={ true } >
					{ this.translate( 'Cancelling Domain…' ) }
				</FormButton>
			);
		}

		const selectedReason = this.state.selectedReason,
			confirmed = this.state.confirmed;

		if ( selectedReason && 'misspelled' === selectedReason.value ) {
			return (
				<FormButton isPrimary={ true } onClick={ this.onSubmit } disabled={ ! confirmed } >
					{ this.translate( 'Cancel Anyway' ) }
				</FormButton>
			);
		}

		return (
			<FormButton isPrimary={ true } onClick={ this.onSubmit } disabled={ ! confirmed } >
				{ this.translate( 'Cancel Domain' ) }
			</FormButton>
		);
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return <ConfirmCancelDomainLoadingPlaceholder
				purchaseId={ this.props.purchaseId }
				selectedSite={ this.props.selectedSite } />;
		}

		const purchase = getPurchase( this.props ),
			domain = getDomainName( purchase ),
			selectedReason = this.state.selectedReason;

		return (
			<Main className="confirm-cancel-domain">
				<HeaderCake onClick={ this.goToCancelPurchase }>
					{ titles.confirmCancelDomain }
				</HeaderCake>
				<Card>
					<FormSectionHeading className="is-primary">
						{ this.translate( 'Canceling %(domain)s', { args: { domain } } ) }
					</FormSectionHeading>
					<p>
						{ this.translate(
							'Since domain cancellation can cause your site to stop working, ' +
							'we’d like to make sure we help you take the right action. ' +
							'Please select the best option below.'
						) }
					</p>
					<SelectDropdown
							className="confirm-cancel-domain__reasons-dropdown"
							key="confirm-cancel-domain__reasons-dropdown"
							selectedText={ selectedReason
											? selectedReason.label
											: this.translate( 'Please let us know why you wish to cancel.' ) }
							options={ cancellationReasons }
							onSelect={ this.onReasonChange } >
					</SelectDropdown>
					{ this.renderHelpMessage() }
					{ this.renderConfirmationCheckbox() }
					{ this.renderSubmitButton() }
				</Card>
			</Main>
		);
	}
} );

export default connect(
	null,
	( dispatch ) => {
		return {
			refreshSitePlans( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
			}
		};
	}
)( ConfirmCancelDomain );
