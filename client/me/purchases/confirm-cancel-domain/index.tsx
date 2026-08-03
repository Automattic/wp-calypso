import { purchaseQuery } from '@automattic/api-queries';
import { isDomainRegistration } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, CompactCard, FormLabel } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ActionPanelLink from 'calypso/components/action-panel/link';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextarea from 'calypso/components/forms/form-textarea';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { cancelAndRefundPurchase } from 'calypso/lib/purchases/actions';
import { cancelPurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getName as getDomainName } from '../lib/raw-purchase-helpers';
import cancellationReasons from './cancellation-reasons';
import ConfirmCancelDomainLoadingPlaceholder from './loading-placeholder';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';
import type { ChangeEvent, SyntheticEvent } from 'react';

import './style.scss';

interface CancellationReason {
	value: string;
	label: TranslateResult;
	helpMessage: TranslateResult;
	showTextarea?: boolean;
}

interface ConfirmCancelDomainOwnProps {
	purchaseId: number;
	siteSlug: string;
	purchaseListUrl?: string;
	getCancelPurchaseUrlFor?: ( siteSlug: string, purchaseId: number ) => string;
}

interface ConfirmCancelDomainQueryProps {
	purchase: Purchase | undefined;
	hasLoadedPurchasesFromServer: boolean;
}

interface ConfirmCancelDomainConnectedProps {
	hasLoadedSites: boolean;
	isDomainOnlySite: boolean | null;
	selectedSite: SiteDetails | null | undefined;
	clearPurchases: typeof clearPurchases;
	errorNotice: typeof errorNotice;
	refreshSitePlans: typeof refreshSitePlans;
	receiveDeletedSite: typeof receiveDeletedSite;
	setAllSitesSelected: typeof setAllSitesSelected;
	successNotice: typeof successNotice;
}

type ConfirmCancelDomainProps = ConfirmCancelDomainOwnProps &
	ConfirmCancelDomainQueryProps &
	ConfirmCancelDomainConnectedProps &
	LocalizeProps;

interface ConfirmCancelDomainState {
	selectedReason: CancellationReason | null;
	message: string;
	confirmed: boolean;
	submitting: boolean;
}

class ConfirmCancelDomain extends Component< ConfirmCancelDomainProps, ConfirmCancelDomainState > {
	state: ConfirmCancelDomainState = {
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

	isDataLoading = () => {
		return ! this.props.hasLoadedSites || ! this.props.hasLoadedPurchasesFromServer;
	};

	redirectIfDataIsInvalid = () => {
		if ( this.isDataLoading() || this.state.submitting ) {
			return;
		}

		const { purchase, selectedSite } = this.props;

		if ( ! purchase || ! isDomainRegistration( purchase ) || ! selectedSite ) {
			page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
		}
	};

	isValidReasonToCancel = () => {
		const selectedReason = this.state.selectedReason;

		if ( ! selectedReason ) {
			return false;
		}

		return [ 'other_host', 'transfer' ].indexOf( selectedReason.value ) === -1;
	};

	onSubmit = ( event: SyntheticEvent ) => {
		event.preventDefault();

		const { purchase } = this.props;

		if ( ! purchase || ! this.state.selectedReason ) {
			return;
		}

		const purchaseName = getDomainName( purchase );

		const data = {
			domain_cancel_reason: this.state.selectedReason.value,
			domain_cancel_message: this.state.message,
			confirm: true,
			product_id: purchase.product_id,
			blog_id: purchase.blog_id,
			domain: purchaseName,
		};

		this.setState( { submitting: true } );

		cancelAndRefundPurchase( purchase.ID, data, ( error ) => {
			this.setState( { submitting: false } );

			const { isDomainOnlySite, translate, selectedSite } = this.props;

			if ( isDomainOnlySite && selectedSite ) {
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

			this.props.refreshSitePlans( purchase.blog_id );
			this.props.clearPurchases();

			recordTracksEvent( 'calypso_domain_cancel_form_submit', {
				product_slug: purchase.product_slug,
			} );

			const successMessage = translate(
				'%(purchaseName)s was successfully cancelled and refunded.',
				{ args: { purchaseName } }
			);
			this.props.successNotice( successMessage, { displayOnNextPage: true } );
			page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
		} );
	};

	onReasonChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		const value = event.currentTarget.value;
		this.setState( {
			selectedReason:
				( cancellationReasons as CancellationReason[] ).find(
					( reason ) => reason.value === value
				) ?? null,
		} );
	};

	onConfirmationChange = () => {
		this.setState( { confirmed: ! this.state.confirmed } );
	};

	onMessageChange = ( event: ChangeEvent< HTMLTextAreaElement > ) => {
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
		const { confirmed, submitting } = this.state;
		if ( ! this.isValidReasonToCancel() ) {
			return;
		}

		if ( submitting ) {
			return (
				<FormButton isPrimary disabled>
					{ this.props.translate( 'Cancelling domain…' ) }
				</FormButton>
			);
		}

		return (
			<FormButton isPrimary onClick={ this.onSubmit } disabled={ ! confirmed } scary>
				{ this.props.translate( 'Cancel domain' ) }
			</FormButton>
		);
	};

	render() {
		if ( this.isDataLoading() || ! this.props.purchase ) {
			return (
				<div>
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
							href={ this.props.getCancelPurchaseUrlFor?.(
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
						<option disabled value="disabled" key="disabled">
							{ this.props.translate( 'Please let us know why you wish to cancel.' ) }
						</option>
						{ ( cancellationReasons as CancellationReason[] ).map( ( { value, label } ) => (
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

function mapDispatchToProps( dispatch: CalypsoDispatch ) {
	return bindActionCreators(
		{
			clearPurchases,
			errorNotice,
			refreshSitePlans,
			receiveDeletedSite,
			setAllSitesSelected,
			successNotice,
		},
		dispatch
	);
}

const ConnectedConfirmCancelDomain = connect(
	( state: AppState, props: ConfirmCancelDomainOwnProps & ConfirmCancelDomainQueryProps ) => {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId: number | null = selectedSite ? selectedSite.ID : null;

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedPurchasesFromServer: props.hasLoadedPurchasesFromServer,
			isDomainOnlySite: isDomainOnly( state, selectedSiteId ),
			purchase: props.purchase,
			selectedSite,
		};
	},
	mapDispatchToProps
)( localize( ConfirmCancelDomain ) );

export default function ConfirmCancelDomainContainer( props: ConfirmCancelDomainOwnProps ) {
	const { data: purchase, isPending } = useQuery( {
		...purchaseQuery( props.purchaseId ),
		enabled: Boolean( props.purchaseId ),
	} );

	return (
		<ConnectedConfirmCancelDomain
			{ ...props }
			purchase={ purchase }
			hasLoadedPurchasesFromServer={ ! isPending }
		/>
	);
}
