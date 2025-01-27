import { isDomainRegistration } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, CompactCard, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map, find } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import ActionPanelLink from 'calypso/components/action-panel/link';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextarea from 'calypso/components/forms/form-textarea';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getName as getDomainName } from 'calypso/lib/purchases';
import { cancelAndRefundPurchase } from 'calypso/lib/purchases/actions';
import { cancelPurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isDataLoading } from '../utils';
import cancellationReasons from './cancellation-reasons';
import ConfirmCancelDomainLoadingPlaceholder from './loading-placeholder';

import './style.scss';

class ConfirmCancelDomain extends Component {
	static propTypes = {
		purchaseListUrl: PropTypes.string,
		getCancelPurchaseUrlFor: PropTypes.func,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		isDomainOnlySite: PropTypes.bool,
		purchaseId: PropTypes.number.isRequired,
		receiveDeletedSite: PropTypes.func.isRequired,
		purchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		setAllSitesSelected: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	state = {
		selectedReason: null,
		message: '',
		confirmed: false,
		submitting: false,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
		getCancelPurchaseUrlFor: cancelPurchase,
	};

	componentDidMount() {
		this.redirectIfDataIsInvalid();
	}

	componentDidUpdate() {
		this.redirectIfDataIsInvalid();
	}

	redirectIfDataIsInvalid = () => {
		if ( isDataLoading( this.props ) || this.state.submitting ) {
			return null;
		}

		const { purchase, selectedSite } = this.props;

		if ( ! purchase || ! isDomainRegistration( purchase ) || ! selectedSite ) {
			page.redirect( this.props.purchaseListUrl );
		}
	};

	isValidReasonToCancel = () => {
		const selectedReason = this.state.selectedReason;

		if ( ! selectedReason ) {
			return false;
		}

		return [ 'other_host', 'transfer' ].indexOf( selectedReason.value ) === -1;
	};

	onSubmit = ( event ) => {
		event.preventDefault();

		const { purchase } = this.props;
		const purchaseName = getDomainName( purchase );

		const data = {
			domain_cancel_reason: this.state.selectedReason.value,
			domain_cancel_message: this.state.message,
			confirm: true,
			product_id: purchase.productId,
			blog_id: purchase.siteId,
			domain: purchaseName,
		};

		this.setState( { submitting: true } );

		cancelAndRefundPurchase( purchase.id, data, ( error ) => {
			this.setState( { submitting: false } );

			const { isDomainOnlySite, translate, selectedSite } = this.props;

			if ( isDomainOnlySite ) {
				this.props.receiveDeletedSite( selectedSite.ID );
				this.props.setAllSitesSelected();
			}

			if ( error ) {
				this.props.errorNotice(
					translate(
						'Unable to cancel your purchase. Please try again later or {{a}}contact support{{/a}}.',
						{
							components: {
								a: <ActionPanelLink href="/help/contact" />,
							},
						}
					)
				);

				return;
			}

			this.props.refreshSitePlans( purchase.siteId );
			this.props.clearPurchases();

			recordTracksEvent( 'calypso_domain_cancel_form_submit', {
				product_slug: purchase.productSlug,
			} );

			const successMessage = translate(
				'%(purchaseName)s was successfully cancelled and refunded.',
				{ args: { purchaseName } }
			);
			this.props.successNotice( successMessage, { displayOnNextPage: true } );
			page.redirect( this.props.purchaseListUrl );
		} );
	};

	onReasonChange = ( event ) => {
		const select = event.currentTarget;
		this.setState( {
			selectedReason: find( cancellationReasons, { value: select[ select.selectedIndex ].value } ),
		} );
	};

	onConfirmationChange = () => {
		this.setState( { confirmed: ! this.state.confirmed } );
	};

	onMessageChange = ( event ) => {
		this.setState( {
			message: event.target.value,
		} );
	};

	renderHelpMessage = () => {
		const selectedReason = this.state.selectedReason;

		if ( ! selectedReason ) {
			return;
		}

		return (
			<div className="confirm-cancel-domain__help-message">
				{ selectedReason.showTextarea ? (
					<>
						<p>{ selectedReason.helpMessage }</p>
						<FormTextarea
							className="confirm-cancel-domain__reason-details"
							onChange={ this.onMessageChange }
						/>
					</>
				) : (
					<CompactCard className="confirm-cancel-domain__help-card" highlight="warning">
						<span>{ selectedReason.helpMessage }</span>
					</CompactCard>
				) }
			</div>
		);
	};

	renderConfirmationCheckbox = () => {
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
	};

	renderSubmitButton = () => {
		if ( ! this.isValidReasonToCancel() ) {
			return;
		}

		if ( this.state.submitting ) {
			return (
				<FormButton isPrimary disabled>
					{ this.props.translate( 'Cancelling domain…' ) }
				</FormButton>
			);
		}

		const selectedReason = this.state.selectedReason;
		const confirmed = this.state.confirmed;

		if ( selectedReason && 'misspelled' === selectedReason.value ) {
			return (
				<FormButton isPrimary onClick={ this.onSubmit } disabled={ ! confirmed }>
					{ this.props.translate( 'Cancel anyway' ) }
				</FormButton>
			);
		}

		return (
			<FormButton isPrimary onClick={ this.onSubmit } disabled={ ! confirmed }>
				{ this.props.translate( 'Cancel domain' ) }
			</FormButton>
		);
	};

	render() {
		if ( isDataLoading( this.props ) || ! this.props.purchase ) {
			return (
				<div>
					<QueryUserPurchases />
					<ConfirmCancelDomainLoadingPlaceholder />
				</div>
			);
		}

		const { purchase } = this.props;
		const domain = getDomainName( purchase );

		return (
			<Fragment>
				<TrackPurchasePageView
					eventName="calypso_confirm_cancel_domain_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				<PageViewTracker
					path="/me/purchases/:site/:purchaseId/confirm-cancel-domain"
					title="Purchases > Confirm Cancel Domain"
				/>

				<Card className="confirm-cancel-domain__card">
					<div className="confirm-cancel-domain__back">
						<HeaderCakeBack
							icon="chevron-left"
							href={ this.props.getCancelPurchaseUrlFor(
								this.props.siteSlug,
								this.props.purchaseId
							) }
						/>
					</div>
					<FormattedHeader
						className="confirm-cancel-domain__formatted-header"
						brandFont
						headerText={ this.props.translate( 'Canceling %(domain)s', { args: { domain } } ) }
						align="left"
					/>
					<p>
						{ this.props.translate(
							'Since domain cancellation can cause your site to stop working, ' +
								'we’d like to make sure we help you take the right action. ' +
								'Please select the best option below.'
						) }
					</p>
					<FormSelect
						className="confirm-cancel-domain__reasons-dropdown"
						onChange={ this.onReasonChange }
						defaultValue="disabled"
					>
						<option disabled="disabled" value="disabled" key="disabled">
							{ this.props.translate( 'Please let us know why you wish to cancel.' ) }
						</option>
						{ map( cancellationReasons, ( { value, label } ) => (
							<option value={ value } key={ value }>
								{ label }
							</option>
						) ) }
					</FormSelect>
					{ this.renderHelpMessage() }
					{ this.renderConfirmationCheckbox() }
					{ this.renderSubmitButton() }
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	( state, props ) => {
		const selectedSite = getSelectedSite( state );

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isDomainOnlySite: isDomainOnly( state, selectedSite && selectedSite.ID ),
			purchase: getByPurchaseId( state, props.purchaseId ),
			selectedSite,
		};
	},
	{
		clearPurchases,
		errorNotice,
		refreshSitePlans,
		receiveDeletedSite,
		setAllSitesSelected,
		successNotice,
	}
)( localize( ConfirmCancelDomain ) );
