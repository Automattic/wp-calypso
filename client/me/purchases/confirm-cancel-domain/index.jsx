import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * External Dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import cancellationReasons from './cancellation-reasons';
import { cancelAndRefundPurchase } from 'lib/upgrades/actions';
import Card from 'components/card';
import { clearPurchases } from 'state/purchases/actions';
import ConfirmCancelDomainLoadingPlaceholder from './loading-placeholder';
import { connect } from 'react-redux';
import FormButton from 'components/forms/form-button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormTextarea from 'components/forms/form-textarea';
import HeaderCake from 'components/header-cake';
import { isDomainOnlySite as isDomainOnly } from 'state/selectors';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getName as getDomainName } from 'lib/purchases';
import { getPurchase, goToCancelPurchase, isDataLoading, recordPageView } from '../utils';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { isDomainRegistration } from 'lib/products-values';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import notices from 'notices';
import paths from 'me/purchases/paths';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { receiveDeletedSite as receiveDeletedSiteDeprecated } from 'lib/sites-list/actions';
import { receiveDeletedSite } from 'state/sites/actions';
import { refreshSitePlans } from 'state/sites/plans/actions';
import SelectDropdown from 'components/select-dropdown';
import { setAllSitesSelected } from 'state/ui/actions';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

const ConfirmCancelDomain = React.createClass( {
	propTypes: {
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		isDomainOnlySite: PropTypes.bool,
		purchaseId: PropTypes.number.isRequired,
		receiveDeletedSite: PropTypes.func.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		setAllSitesSelected: PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			selectedReason: null,
			message: '',
			confirmed: false,
			submitting: false,
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
			page.redirect( paths.purchasesRoot() );
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

		const purchase = getPurchase( this.props ), purchaseName = getDomainName( purchase );

		const data = {
			domain_cancel_reason: this.state.selectedReason.value,
			domain_cancel_message: this.state.message,
			confirm: true,
			product_id: purchase.productId,
			blog_id: purchase.siteId,
			domain: purchaseName,
		};

		this.setState( { submitting: true } );

		cancelAndRefundPurchase( purchase.id, data, error => {
			this.setState( { submitting: false } );

			const { isDomainOnlySite, translate, selectedSite } = this.props;

			if ( isDomainOnlySite ) {
				// Removing the domain from a domain-only site results
				// in the site being deleted entirely. We need to call
				// `receiveDeletedSiteDeprecated` here because the site
				// exists in `sites-list` as well as the global store.
				receiveDeletedSiteDeprecated( selectedSite );
				this.props.receiveDeletedSite( selectedSite.ID );
				this.props.setAllSitesSelected();
			}

			if ( error ) {
				notices.error(
					error.message ||
						translate(
							'Unable to cancel your purchase. Please try again later or contact support.'
						)
				);

				return;
			}

			notices.success(
				translate( '%(purchaseName)s was successfully cancelled and refunded.', {
					args: { purchaseName },
				} ),
				{ persistent: true }
			);

			this.props.refreshSitePlans( purchase.siteId );

			this.props.clearPurchases();

			analytics.tracks.recordEvent( 'calypso_domain_cancel_form_submit', {
				product_slug: purchase.productSlug,
			} );

			page.redirect( paths.purchasesRoot() );
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
			message: event.target.value,
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
					<FormTextarea
						className="confirm-cancel-domain__reason-details"
						onChange={ this.onMessageChange }
					/> }
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
						{ this.props.translate(
							'I understand that canceling means that I may {{strong}}lose this domain forever{{/strong}}.',
							{
								components: {
									strong: <strong />,
								},
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
				<FormButton isPrimary={ true } disabled={ true }>
					{ this.props.translate( 'Cancelling Domain…' ) }
				</FormButton>
			);
		}

		const selectedReason = this.state.selectedReason, confirmed = this.state.confirmed;

		if ( selectedReason && 'misspelled' === selectedReason.value ) {
			return (
				<FormButton isPrimary={ true } onClick={ this.onSubmit } disabled={ ! confirmed }>
					{ this.props.translate( 'Cancel Anyway' ) }
				</FormButton>
			);
		}

		return (
			<FormButton isPrimary={ true } onClick={ this.onSubmit } disabled={ ! confirmed }>
				{ this.props.translate( 'Cancel Domain' ) }
			</FormButton>
		);
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return (
				<div>
					<QueryUserPurchases userId={ user.get().ID } />
					<ConfirmCancelDomainLoadingPlaceholder
						purchaseId={ this.props.purchaseId }
						selectedSite={ this.props.selectedSite }
					/>
					;
				</div>
			);
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
						{ this.props.translate( 'Canceling %(domain)s', { args: { domain } } ) }
					</FormSectionHeading>
					<p>
						{ this.props.translate(
							'Since domain cancellation can cause your site to stop working, ' +
								'we’d like to make sure we help you take the right action. ' +
								'Please select the best option below.'
						) }
					</p>
					<SelectDropdown
						className="confirm-cancel-domain__reasons-dropdown"
						key="confirm-cancel-domain__reasons-dropdown"
						selectedText={
							selectedReason
								? selectedReason.label
								: this.props.translate( 'Please let us know why you wish to cancel.' )
						}
						options={ cancellationReasons }
						onSelect={ this.onReasonChange }
					/>
					{ this.renderHelpMessage() }
					{ this.renderConfirmationCheckbox() }
					{ this.renderSubmitButton() }
				</Card>
			</Main>
		);
	},
} );

export default connect(
	( state, props ) => {
		const selectedSite = getSelectedSiteSelector( state );

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isDomainOnlySite: isDomainOnly( state, selectedSite && selectedSite.ID ),
			selectedPurchase: getByPurchaseId( state, props.purchaseId ),
			selectedSite,
		};
	},
	{
		clearPurchases,
		refreshSitePlans,
		receiveDeletedSite,
		setAllSitesSelected,
	}
)( localize( ConfirmCancelDomain ) );
