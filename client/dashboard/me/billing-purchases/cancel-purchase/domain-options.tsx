import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_NAMESERVERS } from '@automattic/urls';
import { RadioControl, CheckboxControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import type { CancelPurchaseState } from './types';
import type { Purchase } from '@automattic/api-core';

const NonRefundableDomainMappingMessage = ( {
	includedDomainPurchase,
}: {
	includedDomainPurchase: Purchase;
} ) => {
	if ( ! includedDomainPurchase.meta ) {
		return null;
	}
	return (
		<div>
			<p>
				{ sprintf(
					/* translators: %(mappedDomain)s is a domain name */
					__(
						'This plan includes the custom domain mapping for %(mappedDomain)s. ' +
							'The domain will not be removed along with the plan, to avoid any interruptions for your visitors.'
					),
					{
						mappedDomain: includedDomainPurchase.meta,
					}
				) }
			</p>
		</div>
	);
};

const CancelableDomainMappingMessage = ( {
	includedDomainPurchase,
	purchase,
}: {
	includedDomainPurchase: Purchase;
	purchase: Purchase;
} ) => {
	if ( ! includedDomainPurchase.meta ) {
		return null;
	}
	return (
		<div>
			<p>
				{ sprintf(
					/* translators: %(mappedDomain)s is a domain name */
					__(
						'This plan includes mapping for the domain %(mappedDomain)s. ' +
							"Cancelling will remove all the plan's features from your site, including the domain."
					),
					{
						mappedDomain: includedDomainPurchase.meta,
					}
				) }
			</p>
			<p>
				{ sprintf(
					/* translators: %(mappedDomain)s and %(wordpressSiteUrl) are both domain names */
					__(
						'Your site will no longer be available at %(mappedDomain)s. Instead, it will be at %(wordpressSiteUrl)s'
					),
					{
						mappedDomain: includedDomainPurchase.meta,
						wordpressSiteUrl: purchase.domain,
					}
				) }
			</p>
			<p>
				{ sprintf(
					/* translators: %(mappedDomain)s is a domain name */
					__(
						'The domain %(mappedDomain)s itself is not canceled. Only the connection between WordPress.com and ' +
							'your domain is removed. %(mappedDomain)s is registered elsewhere and you can still use it with other sites.'
					),
					{
						mappedDomain: includedDomainPurchase.meta,
					}
				) }
			</p>
		</div>
	);
};

const CancelPlanWithoutCancellingDomainMessage = ( {
	planPurchase,
	includedDomainPurchase,
}: {
	planPurchase: Purchase;
	includedDomainPurchase: Purchase;
} ) => {
	if ( ! includedDomainPurchase.meta ) {
		return null;
	}
	return (
		<div>
			<p>
				{ 'domain_transfer' === includedDomainPurchase.product_slug
					? sprintf(
							/* translators: %(domain)s is the domain name */
							__(
								'This plan includes a domain transfer, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.'
							),
							{
								domain: includedDomainPurchase.meta,
							}
					  )
					: sprintf(
							/* translators: %(domain)s is the domain name */
							__(
								'This plan includes the custom domain, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.'
							),
							{
								domain: includedDomainPurchase.meta,
							}
					  ) }
			</p>
			{ planPurchase.is_refundable && (
				<p>
					{ sprintf(
						/* translators: %(refundAmount)s, %(planCost)s and %(domainCost)s are all monetary amounts */
						__(
							'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
								'minus %(domainCost)s for the domain.'
						),
						{
							domainCost: includedDomainPurchase.cost_to_unbundle_display,
							planCost: planPurchase.total_refund_text,
							refundAmount: planPurchase.refund_text,
						}
					) }
				</p>
			) }
		</div>
	);
};

const CancelPurchaseDomainOptions = ( {
	includedDomainPurchase,
	cancelBundledDomain,
	purchase,
	onCancelConfirmationStateChange,
	isLoading = false,
}: {
	includedDomainPurchase: Purchase;
	cancelBundledDomain: boolean;
	purchase: Purchase;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	isLoading: boolean;
} ) => {
	const { recordTracksEvent } = useAnalytics();
	const [ confirmCancel, setConfirmCancel ] = useState( false );

	const onCancelBundledDomainChange = useCallback(
		( value: string ) => {
			const newCancelBundledDomainValue = value === 'cancel';
			onCancelConfirmationStateChange( {
				cancelBundledDomain: newCancelBundledDomainValue,
				confirmCancelBundledDomain: newCancelBundledDomainValue && confirmCancel,
			} );
		},
		[ confirmCancel, onCancelConfirmationStateChange ]
	);

	const onConfirmCancelBundledDomainChange = useCallback(
		( checked: boolean ) => {
			setConfirmCancel( checked );
			onCancelConfirmationStateChange( {
				cancelBundledDomain,
				confirmCancelBundledDomain: checked,
			} );

			// Record tracks event for domain confirmation checkbox
			recordTracksEvent( 'calypso_purchases_domain_confirm_checkbox', {
				product_slug: purchase.product_slug,
				purchase_id: purchase?.ID,
				domain_name: includedDomainPurchase.meta,
				checked: checked,
			} );
		},
		[
			cancelBundledDomain,
			onCancelConfirmationStateChange,
			purchase,
			includedDomainPurchase,
			recordTracksEvent,
		]
	);

	if (
		! includedDomainPurchase ||
		'one-time-purchase' === purchase.expiry_status ||
		purchase.is_domain_registration
	) {
		return null;
	}

	if (
		'domain_map' !== includedDomainPurchase.product_slug &&
		! includedDomainPurchase.is_domain_registration &&
		'domain_transfer' !== includedDomainPurchase.product_slug
	) {
		return null;
	}

	// Domain mappings get treated separately for now. (It is also rare for a
	// plan's domain credit to be used on a domain mapping in the first place.)
	if ( 'domain_map' === includedDomainPurchase.product_slug ) {
		if ( ! purchase.is_refundable ) {
			return (
				<NonRefundableDomainMappingMessage includedDomainPurchase={ includedDomainPurchase } />
			);
		}

		return (
			<CancelableDomainMappingMessage
				includedDomainPurchase={ includedDomainPurchase }
				purchase={ purchase }
			/>
		);
	}

	// In most other cases, we'll cancel the plan and leave the domain alone.
	// Those are handled here.
	// The one exception is when a plan and domain registration are both in
	// their refund window (e.g. they were recently purchased, and likely
	// purchased together), in which case we allow the user to cancel both at
	// the same time for convenience. We don't do that for domain transfers
	// currently, although we probably could (but domain transfers are
	// inherently in a state of flux and also potentially harder for customers
	// to understand exactly what they're cancelling).
	if (
		'domain_transfer' === includedDomainPurchase.product_slug ||
		! purchase.is_refundable ||
		! includedDomainPurchase.is_refundable
	) {
		return (
			<CancelPlanWithoutCancellingDomainMessage
				includedDomainPurchase={ includedDomainPurchase }
				planPurchase={ purchase }
			/>
		);
	}

	if ( ! includedDomainPurchase.meta ) {
		return null;
	}

	return (
		<>
			<p>
				{ createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name */
						__(
							'Your plan includes the custom domain <strong>%(domain)s</strong>. What would you like to do with the domain?'
						),
						{
							domain: includedDomainPurchase.meta,
						}
					),
					{
						strong: <strong />,
					}
				) }
			</p>
			<p>
				<RadioControl
					name="keep_bundled_domain_false"
					id="keep_bundled_domain_false_control"
					options={ [
						{
							label: sprintf(
								/* translators: %(domain)s is a domain name */
								__( 'Cancel the plan, but keep "%(domain)s"' ),
								{
									domain: includedDomainPurchase.meta,
								}
							),
							value: 'keep',
							description: sprintf(
								/* translators: %(refundAmount)s and %(domainCost)s are both monetary amounts. %(productName)s is the name of the product */
								__(
									"You'll receive a partial refund of %(refundAmount)s -- the cost of the %(productName)s " +
										'plan, minus %(domainCost)s for the domain. There will be no change to your domain ' +
										"registration, and you're free to use it on WordPress.com or transfer it elsewhere."
								),
								{
									productName: purchase.product_name,
									domainCost: includedDomainPurchase.cost_to_unbundle_display,
									refundAmount: purchase.refund_text,
								}
							),
						},
						{
							label: sprintf(
								/* translators: %(domain)s is the domain name */
								__( 'Cancel the plan and the domain "%(domain)s"' ),
								{
									domain: includedDomainPurchase.meta,
								}
							),
							value: 'cancel',
							description: sprintf(
								/* translators: %(planCost)s is the monetary amount that the customer will receive in the form of a refund */
								__(
									"You'll receive a full refund of %(planCost)s. The domain will be cancelled, and it's possible " +
										"you'll lose it permanently."
								),
								{
									planCost: purchase.total_refund_text,
								}
							),
						},
					] }
					selected={ cancelBundledDomain ? 'cancel' : 'keep' }
					onChange={ onCancelBundledDomainChange }
					disabled={ isLoading }
				/>
			</p>
			{ cancelBundledDomain && (
				<p>
					{ createInterpolateElement(
						__(
							"When you cancel a domain, it becomes unavailable for a while. Anyone may register it once it's " +
								"available again, so it's possible you won't have another chance to register it in the future. " +
								"If you'd like to use your domain on a site hosted elsewhere, consider <a>updating your name " +
								'servers</a> instead.'
						),
						{
							a: (
								<a
									href={ localizeUrl( UPDATE_NAMESERVERS ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						}
					) }
					<label>
						<CheckboxControl
							checked={ confirmCancel }
							onChange={ onConfirmCancelBundledDomainChange }
							disabled={ isLoading }
						/>
						<span className="cancel-purchase__domain-confirm">
							{ createInterpolateElement(
								__(
									'I understand that canceling my domain means I might <strong>never be able to register it ' +
										'again</strong>.'
								),
								{
									strong: <strong />,
								}
							) }
						</span>
					</label>
				</p>
			) }
		</>
	);
};

export default CancelPurchaseDomainOptions;
