import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';
import { DetailedPayment } from 'calypso/data/promote-post/use-promote-post-payment-details-query';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import { WPCOMPrintLogo } from 'calypso/my-sites/promote-post-i2/components/payments-receipt/WPComPrintLogo';
import { getSite } from 'calypso/state/sites/selectors';

interface ReceiptTemplateProps {
	payment: Payment | DetailedPayment;
	billingDetails: string;
	isPrintView?: boolean;
	isLoading?: boolean;
	onBillingDetailsChange?: ( value: string ) => void;
}

/**
 * The receipt template is shown in the user's view and the print dialogue.
 * When isPrintView is true, it renders a simplified version suitable for printing
 * For example, without the help text and editable text area, which changes to a static output.
 */
export const Receipt = ( {
	payment,
	billingDetails,
	isPrintView = false,
	isLoading = false,
	onBillingDetailsChange,
}: ReceiptTemplateProps ) => {
	const localeSlug = getLocaleSlug() || 'en_US';
	const paymentDate = moment( payment.date ).locale( localeSlug ).format( 'LL' );

	// Get all the sites from the campaigns
	const sites = useSelector( ( state ) => {
		if ( ! Array.isArray( payment.campaigns ) ) {
			return {};
		}

		const sitesData: Record< number, any > = {};
		payment.campaigns.forEach( ( campaign ) => {
			const site = getSite( state, campaign.site_id );
			if ( site ) {
				sitesData[ campaign.site_id ] = site;
			}
		} );
		return sitesData;
	} );

	return (
		<>
			{ /* Header */ }
			<div className="payment-receipt__header">
				<div className="payment-receipt__organization-logo">
					{ /* Inline logo because we need to insert it in the iframe. So relative path won't work. */ }
					<WPCOMPrintLogo />
				</div>
				<div className="payment-receipt__organization-details">
					<div className="payment-receipt__organization-name">{ __( 'WordPress.com' ) }</div>
					<div className="payment-receipt__secondary-text">
						{ __( 'by Automattic, Inc' ) }
						<br />
						{ __( '60 29th St. #343, San Francisco, CA 94110' ) }
					</div>
				</div>
				<div className="payment-receipt__date payment-receipt__value">{ paymentDate }</div>
			</div>

			{ /* Receipt Info */ }
			<div className="payment-receipt__section">
				<div className="payment-receipt__row payment-receipt__date-mobile">
					<div className="payment-receipt__label">{ __( 'Date' ) }</div>
					<div className="payment-receipt__value">{ paymentDate }</div>
				</div>
				<div className="payment-receipt__row">
					<div className="payment-receipt__label">{ __( 'Payment ID' ) }</div>
					<div className="payment-receipt__value">{ payment.id }</div>
				</div>
				<div className="payment-receipt__row">
					<div className="payment-receipt__label">{ __( 'Status' ) }</div>
					<div className="payment-receipt__value">{ _.capitalize( payment.status ) }</div>
				</div>
				<div className="payment-receipt__billing-details">
					<div className="payment-receipt__label">{ __( 'Billing Details' ) }</div>
					{ ! isPrintView && (
						<div className="payment-receipt__secondary-text">
							{ __(
								'Use this field to add your billing information (eg. business address) before printing.'
							) }
						</div>
					) }
					{ /*Here we either show a text area so the user can enter the details or the static output of the text for the print version.*/ }
					{ isPrintView ? (
						<div className="payment-receipt__value payment-receipt__billing-text">
							{ billingDetails }
						</div>
					) : (
						<textarea
							className="payment-receipt__billing-textarea"
							placeholder={ __(
								'Use this field to add your billing information (e.g. business address) before printing.'
							) }
							value={ billingDetails }
							onChange={ ( e ) => onBillingDetailsChange?.( e.target.value ) }
						/>
					) }
				</div>
			</div>

			{ /* Campaign Summary */ }
			<div className="payment-receipt__section">
				<h3 className="payment-receipt__section-title">{ __( 'Campaign summary' ) }</h3>
				{ isLoading && (
					<div className="payment-receipt__inline-loading">
						<Spinner />
						<div className="payment-receipt__secondary-text">
							{ __( 'Loading campaign details.' ) }
						</div>
					</div>
				) }

				{ ! isLoading &&
					( ! Array.isArray( payment.campaigns ) || payment.campaigns.length === 0 ) && (
						<div className="payment-receipt__secondary-text">
							{ __( 'No campaign details available' ) }
						</div>
					) }

				{ ! isLoading && Array.isArray( payment.campaigns ) && payment.campaigns.length > 0 && (
					<>
						{ payment.campaigns.map( ( campaign ) => {
							const site = sites[ campaign.site_id ];

							return (
								<div className="payment-receipt__list-item" key={ campaign.campaign_id }>
									<div className="payment-receipt__item-content">
										<div className="payment-receipt__label payment-receipt__item-with-margin">
											{ campaign.name }
										</div>
										<div className="payment-receipt__value payment-receipt__item-with-margin">
											{ sprintf(
												/* translators: %d is the campaign ID */
												__( 'Campaign ID: %d' ),
												campaign.campaign_id
											) }
										</div>
										<div className="payment-receipt__value payment-receipt__item-with-margin">
											{ sprintf(
												/* translators: %s is the number of impressions */
												__( 'Total Impressions: %s' ),
												campaign.impressions.toLocaleString()
											) }
										</div>
										{ site?.domain && (
											<div className="payment-receipt__value payment-receipt__item-with-margin">
												{ sprintf(
													/* translators: %s is the site domain */
													__( 'Site: %s' ),
													site.domain
												) }
											</div>
										) }
									</div>
									<div className="payment-receipt__value-bold">
										${ campaign.total.toFixed( 2 ) }
									</div>
								</div>
							);
						} ) }
					</>
				) }
			</div>

			{ /* Payment Summary */ }
			<div className="payment-receipt__section">
				<h3 className="payment-receipt__section-title">{ __( 'Payment summary' ) }</h3>

				<div className="payment-receipt__payment-details">
					{ payment.payment_method && (
						<div className="payment-receipt__row payment-receipt__payment-method">
							<div className="payment-receipt__label">{ __( 'Payment method:' ) }</div>
							<div className="payment-receipt__value">
								{ _.capitalize( payment.payment_method ) }
							</div>
						</div>
					) }

					<div className="payment-receipt__payment-amounts">
						{ payment.credits_used > 0 && (
							<>
								<div className="payment-receipt__row">
									<div className="payment-receipt__label">{ __( 'Subtotal:' ) }</div>
									<div className="payment-receipt__value">
										$
										{ payment.total_with_credits
											? payment.total_with_credits.toFixed( 2 )
											: '0.00' }
									</div>
								</div>

								<div className="payment-receipt__row">
									<div className="payment-receipt__label">{ __( 'Credits:' ) }</div>
									<div className="payment-receipt__value">
										-${ payment.credits_used.toFixed( 2 ) }
									</div>
								</div>
							</>
						) }

						<div className="payment-receipt__row">
							<div className="payment-receipt__label">{ __( 'Total paid:' ) }</div>
							<div className="payment-receipt__value payment-receipt__value-bold">
								${ payment.total_paid.toFixed( 2 ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
