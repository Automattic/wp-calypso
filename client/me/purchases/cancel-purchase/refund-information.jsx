import config from '@automattic/calypso-config';
import { isDomainRegistration, isDomainMapping } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getCancellationFeatureByKey } from 'calypso/lib/plans/cancellation-features-list';
import { getName, isRefundable, isSubscription, isOneTimePurchase } from 'calypso/lib/purchases';
import { UPDATE_NAMESERVERS } from 'calypso/lib/url/support';
import { getIncludedDomainPurchase } from 'calypso/state/purchases/selectors';
import getPlanCancellationFeatures from './get-plan-cancellation-features';

const CancelPurchaseRefundInformation = ( {
	purchase,
	isJetpackPurchase,
	includedDomainPurchase,
	cancelBundledDomain,
	confirmCancelBundledDomain,
	onCancelConfirmationStateChange,
	site,
} ) => {
	const { refundPeriodInDays } = purchase;
	const moment = useLocalizedMoment();
	const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

	let text;

	const onCancelBundledDomainChange = ( event ) => {
		const newCancelBundledDomainValue = event.currentTarget.value === 'cancel';
		onCancelConfirmationStateChange( {
			cancelBundledDomain: newCancelBundledDomainValue,
			confirmCancelBundledDomain: newCancelBundledDomainValue && confirmCancelBundledDomain,
		} );
	};

	const onConfirmCancelBundledDomainChange = ( event ) => {
		onCancelConfirmationStateChange( {
			cancelBundledDomain,
			confirmCancelBundledDomain: event.target.checked,
		} );
	};

	const featuresList = ( productSlug, hasDomain ) => {
		if ( typeof productSlug !== 'string' ) {
			return null;
		}

		const planCancellationFeatures = getPlanCancellationFeatures( productSlug, hasDomain );

		return (
			<Fragment>
				<div className="cancel-purchase__refund-information-description-header">
					{ i18n.translate( 'When your %(productName)s plan expires you will loose access to:', {
						args: {
							productName: getName( purchase ),
						},
					} ) }
				</div>
				<ul className="cancel-purchase__refund-information--list-plan-features">
					{ planCancellationFeatures.featureList.map( ( cancellationFeature ) => {
						return (
							<li key={ cancellationFeature }>
								<Gridicon
									className="cancel-purchase__refund-information--item-cross-small"
									size={ 24 }
									icon="cross-small"
								/>
								{ getCancellationFeatureByKey( cancellationFeature ) }
							</li>
						);
					} ) }
					{ planCancellationFeatures.andMore && (
						<li
							className="cancel-purchase__refund-information--item-more"
							key="cancellationAndMore"
						>
							<span className="cancel-purchase__refund-information--item-more-span">
								{ i18n.translate( 'And more' ) }
							</span>
						</li>
					) }
				</ul>
			</Fragment>
		);
	};

	const cancelSubscriptionDescription = () => {
		const planSlug = site.plan.product_slug;

		return (
			<div>
				<p className="cancel-purchase__refund-information-subtitle">
					{ i18n.translate(
						'If you cancel your plan subscription your site may appear broken and things may not work properly.'
					) }
				</p>
				<div className="cancel-purchase__refund-information-description">
					{ featuresList( planSlug, includedDomainPurchase ) }
				</div>
			</div>
		);
	};

	if ( isRefundable( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			text = i18n.translate(
				'When you cancel your domain within %(refundPeriodInDays)d days of purchasing, ' +
					"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays },
				}
			);
		}

		if ( isSubscription( purchase ) ) {
			text = [];

			if ( includedDomainPurchase && isDomainMapping( includedDomainPurchase ) ) {
				text.push(
					i18n.translate(
						'This plan includes mapping for the domain %(mappedDomain)s. ' +
							"Cancelling will remove all the plan's features from your site, including the domain.",
						{
							args: {
								mappedDomain: includedDomainPurchase.meta,
							},
						}
					),
					i18n.translate(
						'Your site will no longer be available at %(mappedDomain)s. Instead, it will be at %(wordpressSiteUrl)s',
						{
							args: {
								mappedDomain: includedDomainPurchase.meta,
								wordpressSiteUrl: purchase.domain,
							},
						}
					),
					i18n.translate(
						'The domain %(mappedDomain)s itself is not canceled. Only the connection between WordPress.com and ' +
							'your domain is removed. %(mappedDomain)s is registered elsewhere and you can still use it with other sites.',
						{
							args: {
								mappedDomain: includedDomainPurchase.meta,
							},
						}
					)
				);
			} else if ( includedDomainPurchase && isDomainRegistration( includedDomainPurchase ) ) {
				const planCostText = purchase.totalRefundText;
				if ( isRefundable( includedDomainPurchase ) ) {
					text.push(
						i18n.translate(
							'Your plan includes the custom domain “%(domain)s”. What would you like to do with the domain?',
							{
								args: {
									domain: includedDomainPurchase.meta,
								},
							}
						),
						<FormLabel key="keep_bundled_domain">
							<FormRadio
								name="keep_bundled_domain_false"
								value="keep"
								checked={ ! cancelBundledDomain }
								onChange={ onCancelBundledDomainChange }
								label={
									<Fragment>
										<span className="cancel-budnled-domain__option-header">
											{ i18n.translate( 'Cancel the plan, but keep “%(domain)s”', {
												args: {
													domain: includedDomainPurchase.meta,
												},
											} ) }
										</span>
										<span className="cancel-budnled-domain__option-description">
											{ i18n.translate(
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
									</Fragment>
								}
							/>
						</FormLabel>,
						<FormLabel key="cancel_bundled_domain">
							<FormRadio
								name="cancel_bundled_domain_false"
								value="cancel"
								checked={ cancelBundledDomain }
								onChange={ onCancelBundledDomainChange }
								label={
									<Fragment>
										<span className="cancel-budnled-domain__option-header">
											{ i18n.translate(
												'Cancel the plan {{strong}}and{{/strong}} the domain “%(domain)s”',
												{
													args: {
														domain: includedDomainPurchase.meta,
													},
													components: {
														strong: <strong />,
													},
												}
											) }
										</span>
										<span className="cancel-budnled-domain__option-description">
											{ i18n.translate(
												"You'll receive a full refund of %(planCost)s. The domain will be cancelled, you risk losing it forever," +
													'and visitors to your site may experience difficulties accessing it.',
												{
													args: {
														planCost: planCostText,
													},
												}
											) }
										</span>
									</Fragment>
								}
							/>
						</FormLabel>,
						i18n.translate(
							"Since you are cancelling your plan within %(refundPeriodInDays)d days of purchasing you'll receive a {{spanRefund}}refund of %(refundAmount)s{{/spanRefund}} and it will be removed from your site immediately.",
							{
								args: {
									refundAmount: cancelBundledDomain ? planCostText : purchase.refundText,
									refundPeriodInDays: refundPeriodInDays,
								},
								components: {
									spanRefund: <span className="refund-amount" />,
								},
							}
						)
					);

					if ( cancelBundledDomain ) {
						text.push(
							i18n.translate(
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
							),
							<FormLabel>
								<FormCheckbox
									checked={ confirmCancelBundledDomain }
									onChange={ onConfirmCancelBundledDomainChange }
								/>
								<span>
									{ i18n.translate(
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
						);
					}
				} else {
					text.push(
						i18n.translate(
							'This plan subscription includes the custom domain, %(domain)s' +
								'{{strong}}The domain will not be removed{{/strong}} along with the plan, to avoid any interruptions for your visitors. ',
							{
								args: {
									domain: includedDomainPurchase.meta,
									domainCost: includedDomainPurchase.priceText,
								},
								components: {
									strong: <strong />,
								},
							}
						),
						i18n.translate(
							'You will receive a partial {{spanRefund}}refund of %(refundAmount)s{{/spanRefund}} which is %(planCost)s for the plan ' +
								'minus %(domainCost)s for the domain.',
							{
								args: {
									domainCost: includedDomainPurchase.priceText,
									planCost: planCostText,
									refundAmount: purchase.refundText,
								},
								components: {
									spanRefund: <span className="refund-amount" />,
								},
							}
						)
					);
				}
			} else if ( isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' ) ) {
				// Refundable Jetpack subscription
				text = [];
				text.push(
					i18n.translate(
						'Because you are within the %(refundPeriodInDays)d day refund period, ' +
							'your plan will be cancelled and removed from your site immediately and you will receive a full refund. ',
						{
							args: { refundPeriodInDays },
						}
					),
					i18n.translate(
						'If you want to keep the subscription until the renewal date, please cancel after the refund period has ended.'
					)
				);
			} else {
				text = i18n.translate(
					'When you cancel your subscription within %(refundPeriodInDays)d days of purchasing, ' +
						"you'll receive a refund and it will be removed from your site immediately.",
					{
						args: { refundPeriodInDays },
					}
				);
			}
		}

		if ( isOneTimePurchase( purchase ) ) {
			text = i18n.translate(
				'When you cancel this purchase within %(refundPeriodInDays)d days of purchasing, ' +
					"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays },
				}
			);
		}
	} else if ( isDomainRegistration( purchase ) ) {
		text = i18n.translate(
			'When you cancel your domain, it will remain registered and active until the registration expires, ' +
				'at which point it will be automatically removed from your site.'
		);
	} else if (
		isSubscription( purchase ) &&
		includedDomainPurchase &&
		isDomainMapping( includedDomainPurchase )
	) {
		text.push(
			i18n.translate(
				'This plan subscription includes the custom domain, %(domain)s' +
					'{{strong}}The domain will not be removed{{/strong}} along with the plan, to avoid any interruptions for your visitors. ',
				{
					args: {
						domain: includedDomainPurchase.meta,
						domainCost: includedDomainPurchase.priceText,
					},
					components: {
						strong: <strong />,
					},
				}
			),
			i18n.translate(
				'If you cancel your plan subscription your plan will be removed on %(expireDate)s.',
				{
					args: {
						expiryDate: expiryDate,
					},
				}
			)
		);
	} else if (
		isSubscription( purchase ) &&
		includedDomainPurchase &&
		isDomainRegistration( includedDomainPurchase )
	) {
		text = i18n.translate(
			'This plan subscription includes the custom domain, %(domain)s' +
				'{{strong}}The domain will not be removed{{/strong}} along with the plan, to avoid any interruptions for your visitors. ',
			{
				args: {
					domain: includedDomainPurchase.meta,
					domainCost: includedDomainPurchase.priceText,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	} else {
		text = i18n.translate(
			'If you cancel your plan subscription your plan will be removed on %(expireDate)s.',
			{
				args: {
					expiryDate: expiryDate,
				},
			}
		);
	}

	return (
		<div className="cancel-purchase__info">
			{ isSubscription( purchase ) && ! isJetpackPurchase && cancelSubscriptionDescription() }
			{ Array.isArray( text ) ? (
				text.map( ( paragraph, index ) => (
					<p
						key={ purchase.id + '_refund_p_' + index }
						className="cancel-purchase__refund-information"
					>
						{ paragraph }
					</p>
				) )
			) : (
				<p className="cancel-purchase__refund-information">{ text }</p>
			) }
		</div>
	);
};

CancelPurchaseRefundInformation.propTypes = {
	purchase: PropTypes.object.isRequired,
	isJetpackPurchase: PropTypes.bool.isRequired,
	includedDomainPurchase: PropTypes.object,
	cancelBundledDomain: PropTypes.bool,
	confirmCancelBundledDomain: PropTypes.bool,
	onCancelConfirmationStateChange: PropTypes.func,
	site: PropTypes.object.isRequired,
};

export default connect( ( state, props ) => ( {
	includedDomainPurchase: getIncludedDomainPurchase( state, props.purchase ),
} ) )( CancelPurchaseRefundInformation );
