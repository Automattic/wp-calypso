import { isDomainRegistration } from '@automattic/calypso-products';
import { CompactCard, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_NAMESERVERS } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormRadio from 'calypso/components/forms/form-radio';
import { getName, isRefundable } from 'calypso/lib/purchases';

const CancelPurchaseDomainOptions = ( {
	includedDomainPurchase,
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

	if ( ! includedDomainPurchase || ! isDomainRegistration( includedDomainPurchase ) ) {
		return null;
	}

	if ( ! isRefundable( includedDomainPurchase ) ) {
		return (
			<div>
				{ translate(
					'This plan includes the custom domain, %(domain)s, normally a %(domainCost)s purchase. ' +
						'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
					{
						args: {
							domain: includedDomainPurchase.meta,
							domainCost: includedDomainPurchase.priceText,
						},
					}
				) }
				<p>
					{ translate(
						'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
							'minus %(domainCost)s for the domain.',
						{
							args: {
								domainCost: includedDomainPurchase.priceText,
								planCost: planCostText,
								refundAmount: purchase.refundText,
							},
						}
					) }
				</p>
			</div>
		);
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
