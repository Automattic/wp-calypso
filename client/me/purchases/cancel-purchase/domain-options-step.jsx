import {
	isDomainRegistration,
	isDomainMapping,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_NAMESERVERS } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormRadio from 'calypso/components/forms/form-radio';
import { getName, isRefundable, isSubscription } from 'calypso/lib/purchases';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const NonRefundableDomainMappingMessage = ( { includedDomainPurchase } ) => {
	const translate = useTranslate();
	return (
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
};

const CancelableDomainMappingMessage = ( { includedDomainPurchase, purchase } ) => {
	const translate = useTranslate();
	return (
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
};

const CancelPlanWithoutCancellingDomainMessage = ( { planPurchase, includedDomainPurchase } ) => {
	const translate = useTranslate();
	return (
		<div>
			<p>
				{ isDomainTransfer( includedDomainPurchase )
					? translate(
							'This plan includes a domain transfer, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
							{
								args: {
									domain: includedDomainPurchase.meta,
								},
							}
					  )
					: translate(
							'This plan includes the custom domain, %(domain)s. The domain will not be removed along with the plan, to avoid any interruptions for your visitors.',
							{
								args: {
									domain: includedDomainPurchase.meta,
								},
							}
					  ) }
			</p>
			{ isRefundable( planPurchase ) && (
				<p>
					{ translate(
						'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
							'minus %(domainCost)s for the domain.',
						{
							args: {
								domainCost: includedDomainPurchase.costToUnbundleText,
								planCost: planPurchase.totalRefundText,
								refundAmount: planPurchase.refundText,
							},
						}
					) }
				</p>
			) }
		</div>
	);
};

const DomainOptionsStep = ( {
	includedDomainPurchase,
	purchase,
	onClose,
	onContinue,
	isVisible = false,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ cancelBundledDomain, setCancelBundledDomain ] = useState( false );
	const [ confirmCancel, setConfirmCancel ] = useState( false );

	const onCancelBundledDomainChange = useCallback( ( event ) => {
		const newCancelBundledDomainValue = event.currentTarget.value === 'cancel';
		setCancelBundledDomain( newCancelBundledDomainValue );
		if ( ! newCancelBundledDomainValue ) {
			setConfirmCancel( false );
		}
	}, [] );

	const onConfirmCancelBundledDomainChange = useCallback(
		( event ) => {
			const checked = event.target.checked;
			setConfirmCancel( checked );

			// Record tracks event for domain confirmation checkbox
			dispatch(
				recordTracksEvent( 'calypso_purchases_domain_confirm_checkbox', {
					product_slug: purchase.productSlug,
					purchase_id: purchase.id,
					domain_name: includedDomainPurchase.meta,
					checked: checked,
				} )
			);
		},
		[ purchase, includedDomainPurchase, dispatch ]
	);

	const handleContinue = useCallback( () => {
		onContinue( {
			cancelBundledDomain,
			confirmCancelBundledDomain: cancelBundledDomain && confirmCancel,
		} );
	}, [ cancelBundledDomain, confirmCancel, onContinue ] );

	const canContinue = () => {
		if ( ! cancelBundledDomain ) {
			return true;
		}
		return confirmCancel;
	};

	if ( ! isVisible ) {
		return null;
	}

	if ( ! includedDomainPurchase || ! isSubscription( purchase ) ) {
		return null;
	}

	if (
		! isDomainMapping( includedDomainPurchase ) &&
		! isDomainRegistration( includedDomainPurchase ) &&
		! isDomainTransfer( includedDomainPurchase )
	) {
		return null;
	}

	// Domain mappings get treated separately for now.
	if ( isDomainMapping( includedDomainPurchase ) ) {
		if ( ! isRefundable( purchase ) ) {
			return (
				<BlankCanvas className="domain-options-step">
					<BlankCanvas.Header onBackClick={ onClose }>
						{ translate( 'Domain Options' ) }
					</BlankCanvas.Header>
					<BlankCanvas.Content>
						<NonRefundableDomainMappingMessage includedDomainPurchase={ includedDomainPurchase } />
					</BlankCanvas.Content>
					<BlankCanvas.Footer>
						<div className="domain-options-step__actions">
							<Button isPrimary onClick={ handleContinue } disabled={ ! canContinue() }>
								{ translate( 'Continue' ) }
							</Button>
						</div>
					</BlankCanvas.Footer>
				</BlankCanvas>
			);
		}

		return (
			<BlankCanvas className="domain-options-step">
				<BlankCanvas.Header onBackClick={ onClose }>
					{ translate( 'Domain Options' ) }
				</BlankCanvas.Header>
				<BlankCanvas.Content>
					<CancelableDomainMappingMessage
						includedDomainPurchase={ includedDomainPurchase }
						purchase={ purchase }
					/>
				</BlankCanvas.Content>
				<BlankCanvas.Footer>
					<div className="domain-options-step__actions">
						<Button isPrimary onClick={ handleContinue } disabled={ ! canContinue() }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</BlankCanvas.Footer>
			</BlankCanvas>
		);
	}

	// In most other cases, we'll cancel the plan and leave the domain alone.
	if (
		isDomainTransfer( includedDomainPurchase ) ||
		! isRefundable( purchase ) ||
		! isRefundable( includedDomainPurchase )
	) {
		return (
			<BlankCanvas className="domain-options-step">
				<BlankCanvas.Header onBackClick={ onClose }>
					{ translate( 'Domain Options' ) }
				</BlankCanvas.Header>
				<BlankCanvas.Content>
					<CancelPlanWithoutCancellingDomainMessage
						includedDomainPurchase={ includedDomainPurchase }
						planPurchase={ purchase }
					/>
				</BlankCanvas.Content>
				<BlankCanvas.Footer>
					<div className="domain-options-step__actions">
						<Button isPrimary onClick={ handleContinue } disabled={ ! canContinue() }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</BlankCanvas.Footer>
			</BlankCanvas>
		);
	}

	return (
		<BlankCanvas className="domain-options-step">
			<BlankCanvas.Header onBackClick={ onClose }>
				{ translate( 'Domain Options' ) }
			</BlankCanvas.Header>
			<BlankCanvas.Content>
				<div className="domain-options-step__content">
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
					<div className="domain-options-step__options">
						<div className="domain-options-step__option">
							<FormRadio
								name="keep_bundled_domain"
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
										<span className="domain-options-step__refund-domain-info">
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
						</div>
						<div className="domain-options-step__option">
							<FormRadio
								name="cancel_bundled_domain"
								value="cancel"
								checked={ cancelBundledDomain }
								onChange={ onCancelBundledDomainChange }
								label={
									<>
										{ translate(
											'Cancel the plan {{strong}}and{{/strong}} the domain "%(domain)s"',
											{
												args: {
													domain: includedDomainPurchase.meta,
												},
												components: {
													strong: <strong />,
												},
											}
										) }
										<br />
										<span className="domain-options-step__refund-domain-info">
											{ translate(
												"You'll receive a full refund of %(planCost)s. The domain will be cancelled, and it's possible " +
													"you'll lose it permanently.",
												{
													args: {
														planCost: purchase.totalRefundText,
													},
												}
											) }
										</span>
									</>
								}
							/>
						</div>
					</div>
					{ cancelBundledDomain && (
						<div className="domain-options-step__warning">
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
							<div className="domain-options-step__confirm">
								<FormCheckbox
									checked={ confirmCancel }
									onChange={ onConfirmCancelBundledDomainChange }
								/>
								<span className="domain-options-step__confirm-text">
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
							</div>
						</div>
					) }
				</div>
			</BlankCanvas.Content>
			<BlankCanvas.Footer>
				<div className="domain-options-step__actions">
					<Button isPrimary onClick={ handleContinue } disabled={ ! canContinue() }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</BlankCanvas.Footer>
		</BlankCanvas>
	);
};

export default DomainOptionsStep;
