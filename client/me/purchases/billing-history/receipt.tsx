import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import { Component, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import FormLabel from 'calypso/components/forms/form-label';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment, useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { PARTNER_PAYPAL_EXPRESS } from 'calypso/lib/checkout/payment-methods';
import { billingHistory, vatDetails as vatDetailsPath } from 'calypso/me/purchases/paths';
import titles from 'calypso/me/purchases/titles';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import {
	clearBillingTransactionError,
	requestBillingTransaction,
} from 'calypso/state/billing-transactions/individual-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';
import { VatVendorDetails } from './vat-vendor-details';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';
import type { LocalizeProps } from 'i18n-calypso';
import type { FormEvent } from 'react';

import './style.scss';

interface BillingReceiptProps {
	transactionId: number;
	recordGoogleEvent: ( key: string, message: string ) => void;
	clearBillingTransactionError: ( transactionId: number ) => void;
}

interface BillingReceiptConnectedProps {
	transactionFetchError?: string;
	transaction: BillingTransaction | undefined;
	translate: LocalizeProps[ 'translate' ];
}

class BillingReceipt extends Component< BillingReceiptProps & BillingReceiptConnectedProps > {
	componentDidMount() {
		this.redirectIfInvalidTransaction();
	}

	componentDidUpdate() {
		this.redirectIfInvalidTransaction();
	}

	recordClickEvent = ( action: string ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	handlePrintLinkClick = () => {
		this.recordClickEvent( 'Print Receipt Button in Billing History Receipt' );
		window.print();
	};

	redirectIfInvalidTransaction() {
		const { transactionFetchError, transactionId } = this.props;

		if ( ! transactionFetchError ) {
			return;
		}

		this.props.clearBillingTransactionError( transactionId );
		page.redirect( billingHistory );
	}

	render() {
		const { transaction, transactionId, translate } = this.props;

		return (
			<Main wideLayout className="receipt">
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/billing/:receipt"
					title="Me > Billing History > Receipt"
				/>

				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />

				<QueryBillingTransaction transactionId={ transactionId } />

				<ReceiptTitle backHref={ billingHistory } />

				{ transaction ? (
					<ReceiptBody
						transaction={ transaction }
						handlePrintLinkClick={ this.handlePrintLinkClick }
					/>
				) : (
					<ReceiptPlaceholder />
				) }
			</Main>
		);
	}
}

export function ReceiptBody( {
	transaction,
	handlePrintLinkClick,
}: {
	transaction: BillingTransaction;
	handlePrintLinkClick: () => void;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const title = translate( 'Visit %(url)s', { args: { url: transaction.url }, textOnly: true } );
	const serviceLink = <a href={ transaction.url } title={ title } />;

	return (
		<div>
			<Card compact className="billing-history__receipt-card">
				<div className="billing-history__app-overview">
					<img src={ transaction.icon } title={ transaction.service } alt={ transaction.service } />
					<h2>
						{ translate( '{{link}}%(service)s{{/link}} {{small}}by %(organization)s{{/small}}', {
							components: {
								link: serviceLink,
								small: <small />,
							},
							args: {
								service: transaction.service,
								organization: transaction.org,
							},
							comment:
								'This string is "Service by Organization". ' +
								'The {{link}} and {{small}} add html styling and attributes. ' +
								'Screenshot: https://cloudup.com/isX-WEFYlOs',
						} ) }
						<small className="billing-history__organization-address">{ transaction.address }</small>
					</h2>
					<span className="billing-history__transaction-date">
						{ moment( transaction.date ).format( 'll' ) }
					</span>
				</div>
				<ul className="billing-history__receipt-details group">
					<li>
						<strong>{ translate( 'Receipt ID' ) }</strong>
						<span className="receipt__monospace">{ transaction.id }</span>
					</li>
					<ReceiptTransactionId transaction={ transaction } />
					<ReceiptPaymentMethod transaction={ transaction } />
					{ transaction.cc_num !== 'XXXX' ? (
						<ReceiptDetails transaction={ transaction } />
					) : (
						<EmptyReceiptDetails />
					) }
					{ config.isEnabled( 'me/vat-details' ) && <VatDetails transaction={ transaction } /> }
				</ul>
				<ReceiptLineItems transaction={ transaction } />

				<div className="billing-history__receipt-links">
					<Button primary onClick={ handlePrintLinkClick }>
						{ translate( 'Print Receipt' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
}

function ReceiptTransactionId( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	if ( ! transaction.pay_ref ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Transaction ID' ) }</strong>
			<span className="receipt__monospace">{ transaction.pay_ref }</span>
		</li>
	);
}

function ReceiptPaymentMethod( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	let text;

	if ( transaction.pay_part === PARTNER_PAYPAL_EXPRESS ) {
		text = translate( 'PayPal' );
	} else if ( 'XXXX' !== transaction.cc_num ) {
		text = translate( '%(cardType)s ending in %(cardNum)s', {
			args: {
				cardType: transaction.cc_type.toUpperCase(),
				cardNum: transaction.cc_num,
			},
		} );
	} else {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Payment Method' ) }</strong>
			<span>{ text }</span>
		</li>
	);
}

function UserVatDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const { vatDetails, isLoading, fetchError } = useVatDetails();
	const reduxDispatch = useDispatch();

	const getEmailReceiptLinkClickHandler = ( receiptId: string ) => {
		return ( event: FormEvent< HTMLFormElement > ) => {
			event.preventDefault();
			reduxDispatch( recordGoogleEvent( 'Me', 'Clicked on Receipt Email Button' ) );
			reduxDispatch( sendBillingReceiptEmail( receiptId ) );
		};
	};

	if ( isLoading || fetchError || ! vatDetails.id ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'VAT Details' ) }</strong>
			<span className="receipt__vat-vendor-details-description">
				{ translate(
					'{{noPrint}}You can edit your VAT details {{vatDetailsLink}}on this page{{/vatDetailsLink}}. {{/noPrint}}This is not an official VAT receipt. For an official VAT receipt, {{emailReceiptLink}}email yourself a copy{{/emailReceiptLink}}.',
					{
						components: {
							noPrint: <span className="receipt__no-print" />,
							vatDetailsLink: <a href={ vatDetailsPath } />,
							emailReceiptLink: (
								<Button
									plain
									className="receipt__email-button"
									onClick={ getEmailReceiptLinkClickHandler( transaction.id ) as any }
								/>
							),
						},
					}
				) }
			</span>
			{ vatDetails.name }
			<br />
			{ vatDetails.address }
			<br />
			{ translate( 'VAT #: %(vatCountry)s %(vatId)s', {
				args: {
					vatCountry: vatDetails.country ?? '',
					vatId: vatDetails.id,
				},
				comment: 'This is the user-supplied VAT number, format "UK 553557881".',
			} ) }
		</li>
	);
}

function VatDetails( { transaction }: { transaction: BillingTransaction } ) {
	return (
		<>
			<UserVatDetails transaction={ transaction } />
			<VatVendorDetails transaction={ transaction } />
		</>
	);
}

function ReceiptLineItems( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const groupedTransactionItems = groupDomainProducts( transaction.items, translate );

	const items = groupedTransactionItems.map( ( item ) => {
		const termLabel = getTransactionTermLabel( item, translate );
		return (
			<tr key={ item.id }>
				<td className="billing-history__receipt-item-name">
					<span>{ item.variation }</span>
					<small>({ item.type_localized })</small>
					{ termLabel && <em>{ termLabel }</em> }
					<br />
					{ item.domain && <em>{ item.domain }</em> }
					{ item.licensed_quantity && (
						<em>{ renderTransactionQuantitySummary( item, translate ) }</em>
					) }
				</td>
				<td className={ 'billing-history__receipt-amount ' + transaction.credit }>
					{ formatCurrency( item.amount_integer, item.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) }
					{ transaction.credit && (
						<span className="billing-history__credit-badge">{ translate( 'Refund' ) }</span>
					) }
				</td>
			</tr>
		);
	} );

	return (
		<div className="billing-history__receipt">
			<h4>{ translate( 'Order summary' ) }</h4>
			<table className="billing-history__receipt-line-items">
				<thead>
					<tr>
						<th className="billing-history__receipt-desc">{ translate( 'Description' ) }</th>
						<th className="billing-history__receipt-amount">{ translate( 'Amount' ) }</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<td className="billing-history__receipt-desc">
							<strong>
								{ translate( 'Total paid:', { comment: 'Total amount paid for product' } ) }
							</strong>
						</td>
						<td
							className={
								'billing-history__receipt-amount billing-history__total-amount ' +
								transaction.credit
							}
						>
							<TransactionAmount transaction={ transaction } />
						</td>
					</tr>
				</tfoot>
				<tbody>{ items }</tbody>
			</table>
		</div>
	);
}

function ReceiptDetails( { transaction }: { transaction: BillingTransaction } ) {
	if ( ! transaction.cc_name && ! transaction.cc_email ) {
		return null;
	}

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
				defaultValue={ transaction.cc_name + '\n' + transaction.cc_email }
			/>
		</li>
	);
}

function EmptyReceiptDetails() {
	// When the content of the text area is empty, hide the "Billing Details" label for printing.
	const [ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ] = useState( true );
	const onChange = useCallback(
		( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
			const value = e.target.value.trim();
			if ( hideDetailsLabelOnPrint && value.length > 0 ) {
				setHideDetailsLabelOnPrint( false );
			} else if ( ! hideDetailsLabelOnPrint && value.length === 0 ) {
				setHideDetailsLabelOnPrint( true );
			}
		},
		[ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ]
	);

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels hideDetailsLabelOnPrint={ hideDetailsLabelOnPrint } />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
				onChange={ onChange }
			/>
		</li>
	);
}

export function ReceiptPlaceholder() {
	return (
		<Card compact className="billing-history__receipt-card is-placeholder">
			<div className="billing-history__app-overview">
				<div className="billing-history__placeholder-image" />
				<div className="billing-history__placeholder-title" />
			</div>

			<div className="billing-history__receipt-links">
				<div className="billing-history__placeholder-link" />
				<div className="billing-history__placeholder-link" />
			</div>
		</Card>
	);
}

function ReceiptLabels( { hideDetailsLabelOnPrint }: { hideDetailsLabelOnPrint?: boolean } ) {
	const translate = useTranslate();

	let labelContent = translate(
		'Use this field to add your billing information (eg. VAT number, business address) before printing.'
	);
	if ( config.isEnabled( 'me/vat-details' ) ) {
		labelContent = translate(
			'Use this field to add your billing information (eg. business address) before printing.'
		);
	}
	return (
		<div>
			<FormLabel
				htmlFor="billing-history__billing-details-textarea"
				className={ classNames( { 'receipt__no-print': hideDetailsLabelOnPrint } ) }
			>
				{ translate( 'Billing Details' ) }
			</FormLabel>
			<div
				className="billing-history__billing-details-description"
				id="billing-history__billing-details-description"
			>
				{ labelContent }
			</div>
		</div>
	);
}

export function ReceiptTitle( { backHref }: { backHref: string } ) {
	const translate = useTranslate();
	return <HeaderCake backHref={ backHref }>{ translate( 'Receipt' ) }</HeaderCake>;
}

export default connect(
	( state: IAppState, { transactionId }: { transactionId: number } ) => {
		const transaction = getPastBillingTransaction( state, transactionId );
		return {
			transaction: transaction && 'service' in transaction ? transaction : undefined,
			transactionFetchError: isPastBillingTransactionError( state, transactionId ),
		};
	},
	{
		clearBillingTransactionError,
		recordGoogleEvent,
		requestBillingTransaction,
	}
)( localize( withLocalizedMoment( BillingReceipt ) ) );
