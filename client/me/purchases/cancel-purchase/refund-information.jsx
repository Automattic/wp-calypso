/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal Dependencies
 */
import {
	getName,
	isRefundable,
	isSubscription,
	isOneTimePurchase,
	maybeWithinRefundPeriod,
} from 'lib/purchases';
import { isDomainRegistration, isDomainMapping } from 'lib/products-values';
import { getIncludedDomainPurchase } from 'state/purchases/selectors';
import { CALYPSO_CONTACT, UPDATE_NAMESERVERS } from 'lib/url/support';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';

const CancelPurchaseRefundInformation = ( {
	purchase,
	includedDomainPurchase,
	cancelBundledDomain,
	confirmCancelBundledDomain,
	onCancelConfirmationStateChange,
} ) => {
	const { refundPeriodInDays } = purchase;
	let text;
	let showSupportLink = true;
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
			text = [
				i18n.translate(
					"We're sorry to hear the %(productName)s plan didn't fit your current needs, but thank you for giving it a try.",
					{
						args: {
							productName: getName( purchase ),
						},
					}
				),
			];
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

				showSupportLink = false;
			} else if ( includedDomainPurchase && isDomainRegistration( includedDomainPurchase ) ) {
				const { precision } = getCurrencyDefaults( purchase.currencyCode );
				const planCostText =
					purchase.currencySymbol +
					parseFloat( purchase.refundAmount + includedDomainPurchase.costToUnbundle ).toFixed(
						precision
					);
				if ( isRefundable( includedDomainPurchase ) ) {
					text.push(
						i18n.translate(
							'Your plan included the custom domain %(domain)s. You can cancel your domain as well as the plan, but keep ' +
								'in mind that when you cancel a domain you risk losing it forever, and visitors to your site may ' +
								'experience difficulties accessing it.',
							{
								args: {
									domain: includedDomainPurchase.meta,
								},
							}
						),
						i18n.translate( "We'd like to offer you two options to choose from:" ),
						<FormLabel key="keep_bundled_domain">
							<FormRadio
								name="keep_bundled_domain_false"
								value="keep"
								checked={ ! cancelBundledDomain }
								onChange={ onCancelBundledDomainChange }
							/>
							<span>
								{ i18n.translate( 'Cancel the plan, but keep %(domain)s.', {
									args: {
										domain: includedDomainPurchase.meta,
									},
								} ) }
								<br />
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
						</FormLabel>,
						<FormLabel key="cancel_bundled_domain">
							<FormRadio
								name="cancel_bundled_domain_false"
								value="cancel"
								checked={ cancelBundledDomain }
								onChange={ onCancelBundledDomainChange }
							/>
							<span>
								{ i18n.translate( 'Cancel the plan {{em}}and{{/em}} the domain "%(domain)s."', {
									args: {
										domain: includedDomainPurchase.meta,
									},
									components: {
										em: <em />,
									},
								} ) }
								<br />
								{ i18n.translate(
									"You'll receive a full refund of %(planCost)s. The domain will be cancelled, and it's possible " +
										"you'll lose it permanently.",
									{
										args: {
											planCost: planCostText,
										},
									}
								) }
							</span>
						</FormLabel>
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
										a: <a href={ UPDATE_NAMESERVERS } target="_blank" rel="noopener noreferrer" />,
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
							'This plan includes the custom domain, %(domain)s, normally a %(domainCost)s purchase. ' +
								'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
							{
								args: {
									domain: includedDomainPurchase.meta,
									domainCost: includedDomainPurchase.priceText,
								},
							}
						),
						i18n.translate(
							'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
								'minus %(domainCost)s for the domain.',
							{
								args: {
									domainCost: includedDomainPurchase.priceText,
									planCost: planCostText,
									refundAmount: purchase.refundText,
								},
							}
						)
					);
				}

				showSupportLink = false;
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
		text = i18n.translate(
			'This plan includes the custom domain mapping for %(mappedDomain)s. ' +
				'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
			{
				args: {
					mappedDomain: includedDomainPurchase.meta,
					mappingCost: includedDomainPurchase.priceText,
				},
			}
		);
	} else if (
		isSubscription( purchase ) &&
		includedDomainPurchase &&
		isDomainRegistration( includedDomainPurchase )
	) {
		text = i18n.translate(
			'This plan includes the custom domain, %(domain)s. ' +
				'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
			{
				args: {
					domain: includedDomainPurchase.meta,
					domainCost: includedDomainPurchase.priceText,
				},
			}
		);
	} else {
		text = i18n.translate(
			"When you cancel your subscription, you'll be able to use %(productName)s until your subscription expires. " +
				'Once it expires, it will be automatically removed from your site.',
			{
				args: {
					productName: getName( purchase ),
				},
			}
		);
	}

	return (
		<div className="cancel-purchase__info">
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

			{ showSupportLink && (
				<strong className="cancel-purchase__support-information">
					{ ! isRefundable( purchase ) && maybeWithinRefundPeriod( purchase )
						? i18n.translate(
								'Have a question? Want to request a refund? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}',
								{
									components: {
										contactLink: <a href={ CALYPSO_CONTACT } />,
									},
								}
						  )
						: i18n.translate(
								'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}',
								{
									components: {
										contactLink: <a href={ CALYPSO_CONTACT } />,
									},
								}
						  ) }
				</strong>
			) }
		</div>
	);
};

CancelPurchaseRefundInformation.propTypes = {
	purchase: PropTypes.object.isRequired,
	includedDomainPurchase: PropTypes.object,
	cancelBundledDomain: PropTypes.bool,
	confirmCancelBundledDomain: PropTypes.bool,
	onCancelConfirmationStateChange: PropTypes.func,
};

export default connect( ( state, props ) => ( {
	includedDomainPurchase: getIncludedDomainPurchase( state, props.purchase ),
} ) )( CancelPurchaseRefundInformation );
