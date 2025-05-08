import { isDomainRegistration, isDomainMapping } from '@automattic/calypso-products';
import { CompactCard, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_NAMESERVERS } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormRadio from 'calypso/components/forms/form-radio';
import { getName, isRefundable, isSubscription } from 'calypso/lib/purchases';

const CancelPurchaseDomainOptions = ( {
	includedDomainPurchase,
	includedDomainTransfer,
	cancelBundledDomain,
	confirmCancelBundledDomain = false,
	purchase,
	onCancelConfirmationStateChange,
} ) => {
	const translate = useTranslate();
	const [ confirmCancel, setConfirmCancel ] = useState( confirmCancelBundledDomain );

	useEffect( () => {
		setConfirmCancel( confirmCancelBundledDomain );
	}, [ confirmCancelBundledDomain ] );

	if ( ( ! includedDomainPurchase && ! includedDomainTransfer ) || ! isSubscription( purchase ) ) {
		return null;
	}

	const onCancelBundledDomainChange = ( event ) => {
		const newCancelBundledDomainValue = event.currentTarget.value === 'cancel';
		onCancelConfirmationStateChange( {
			cancelBundledDomain: newCancelBundledDomainValue,
			confirmCancelBundledDomain: newCancelBundledDomainValue && confirmCancel,
		} );
	};

	const onConfirmCancelBundledDomainChange = ( event ) => {
		const checked = event.target.checked;
		setConfirmCancel( checked );
		onCancelConfirmationStateChange( {
			cancelBundledDomain,
			confirmCancelBundledDomain: checked,
		} );
	};

	const planCostText = purchase.totalRefundText;

	const NonRefundableDomainMappingMessage = () => (
		<div>
			<p>
				{ translate(
					'This plan includes the custom domain mapping for %(mappedDomain)s. ' +
						'The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
					{
						args: {
							mappedDomain: includedDomainPurchase.meta,
						},
					}
				) }
			</p>
		</div>
	);

	const CancelableDomainMappingMessage = () => (
		<div>
			<p>
				{ translate(
					'This plan includes mapping for the domain %(mappedDomain)s. ' +
						"Cancelling will remove all the plan's features from your site, including the domain.",
					{
						args: {
							mappedDomain: includedDomainPurchase.meta,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'Your site will no longer be available at %(mappedDomain)s. Instead, it will be at %(wordpressSiteUrl)s',
					{
						args: {
							mappedDomain: includedDomainPurchase.meta,
							wordpressSiteUrl: purchase.domain,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'The domain %(mappedDomain)s itself is not canceled. Only the connection between WordPress.com and ' +
						'your domain is removed. %(mappedDomain)s is registered elsewhere and you can still use it with other sites.',
					{
						args: {
							mappedDomain: includedDomainPurchase.meta,
						},
					}
				) }
			</p>
		</div>
	);

	const NonRefundableDomainPurchaseMessage = () => (
		<div>
			<p>
				{ translate(
					'This plan includes the custom domain, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
					{
						args: {
							domain: includedDomainPurchase.meta,
						},
					}
				) }
			</p>
		</div>
	);

	const DomainTransferMessage = () => (
		<div>
			<p>
				{ translate(
					'This plan includes a domain transfer, %(domain)s, normally a %(domainCost)s purchase. ' +
						'The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
					{
						args: {
							domain: includedDomainTransfer.meta,
							domainCost: includedDomainTransfer.priceText,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
						'minus %(domainCost)s for the domain.',
					{
						args: {
							domainCost: includedDomainTransfer.priceText,
							planCost: planCostText,
							refundAmount: purchase.refundText,
						},
					}
				) }
			</p>
		</div>
	);

	const RefundablePurchaseWithNonRefundableDomainMessage = () => (
		<div>
			<p>
				{ translate(
					'This plan includes the custom domain, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
					{
						args: {
							domain: includedDomainPurchase.meta,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
						'minus %(domainCost)s for the domain.',
					{
						args: {
							domainCost: includedDomainPurchase.costToUnbundleText,
							planCost: planCostText,
							refundAmount: purchase.refundText,
						},
					}
				) }
			</p>
		</div>
	);

	if ( includedDomainTransfer ) {
		return <DomainTransferMessage />;
	}

	if (
		! isDomainMapping( includedDomainPurchase ) &&
		! isDomainRegistration( includedDomainPurchase )
	) {
		return null;
	}

	// Domain mapping.
	if ( isDomainMapping( includedDomainPurchase ) ) {
		if ( ! isRefundable( purchase ) ) {
			return <NonRefundableDomainMappingMessage />;
		}

		return <CancelableDomainMappingMessage />;
	}

	// Domain registration.
	if ( ! isRefundable( purchase ) ) {
		return <NonRefundableDomainPurchaseMessage />;
	}

	if ( isRefundable( purchase ) && ! isRefundable( includedDomainPurchase ) ) {
		return <RefundablePurchaseWithNonRefundableDomainMessage />;
	}

	return (
		<div className="cancel-purchase__domain-options">
			<p>
				{ translate(
					'Your plan includes the custom domain {{strong}}%(domain)s{{/strong}}. What would you like to do with the domain?',
					{
						args: {
							domain: includedDomainPurchase.meta,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<CompactCard>
				<FormLabel key="keep_bundled_domain">
					<FormRadio
						name="keep_bundled_domain_false"
						value="keep"
						checked={ ! cancelBundledDomain }
						onChange={ onCancelBundledDomainChange }
						label={
							<>
								{ translate( 'Cancel the plan, but keep "%(domain)s"', {
									args: {
										domain: includedDomainPurchase.meta,
									},
								} ) }
								<br />
								<span className="cancel-purchase__refund-domain-info">
									{ translate(
										"You'll receive a partial refund of %(refundAmount)s -- the cost of the %(productName)s " +
											'plan, minus %(domainCost)s for the domain. There will be no change to your domain ' +
											"registration, and you're free to use it on WordPress.com or transfer it elsewhere.",
										{
											args: {
												productName: getName( purchase ),
												domainCost: includedDomainPurchase.costToUnbundleText,
												refundAmount: purchase.refundText,
											},
										}
									) }
								</span>
							</>
						}
					/>
				</FormLabel>
			</CompactCard>
			<CompactCard>
				<FormLabel key="cancel_bundled_domain">
					<FormRadio
						name="cancel_bundled_domain_false"
						value="cancel"
						checked={ cancelBundledDomain }
						onChange={ onCancelBundledDomainChange }
						label={
							<>
								{ translate( 'Cancel the plan {{strong}}and{{/strong}} the domain "%(domain)s"', {
									args: {
										domain: includedDomainPurchase.meta,
									},
									components: {
										strong: <strong />,
									},
								} ) }
								<br />
								<span className="cancel-purchase__refund-domain-info">
									{ translate(
										"You'll receive a full refund of %(planCost)s. The domain will be cancelled, and it's possible " +
											"you'll lose it permanently.",
										{
											args: {
												planCost: planCostText,
											},
										}
									) }
								</span>
							</>
						}
					/>
				</FormLabel>
			</CompactCard>
			{ cancelBundledDomain && (
				<span className="cancel-purchase__domain-warning">
					{ translate(
						"When you cancel a domain, it becomes unavailable for a while. Anyone may register it once it's " +
							"available again, so it's possible you won't have another chance to register it in the future. " +
							"If you'd like to use your domain on a site hosted elsewhere, consider {{a}}updating your name " +
							'servers{{/a}} instead.',
						{
							components: {
								a: (
									<a
										href={ localizeUrl( UPDATE_NAMESERVERS ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
					<FormLabel>
						<FormCheckbox
							checked={ confirmCancel }
							onChange={ onConfirmCancelBundledDomainChange }
						/>
						<span className="cancel-purchase__domain-confirm">
							{ translate(
								'I understand that canceling my domain means I might {{strong}}never be able to register it ' +
									'again{{/strong}}.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</span>
					</FormLabel>
				</span>
			) }
		</div>
	);
};

export default CancelPurchaseDomainOptions;
