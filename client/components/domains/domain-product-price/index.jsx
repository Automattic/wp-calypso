/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import { getTld } from 'lib/domains';

/**
 * Style dependencies
 */
import './style.scss';

function DomainProductPrice( {
	isLoading,
	showTestCopy,
	translate,
	rule,
	isEligibleVariantForDomainTest,
	showDesignUpdate,
	price,
	isFeatured,
	domain,
	isMappingProduct,
	salePrice,
} ) {
	if ( isLoading ) {
		return <div className="domain-product-price is-placeholder">{ translate( 'Loading…' ) }</div>;
	}

	switch ( rule ) {
		case 'FREE_DOMAIN':
			return (
				<FreeProductPrice
					isEligibleVariantForDomainTest={ isEligibleVariantForDomainTest }
					showDesignUpdate={ showDesignUpdate }
					translate={ translate }
					price={ price }
					rule={ rule }
					isFeatured={ isFeatured }
					domain={ domain }
				/>
			);
		case 'FREE_WITH_PLAN':
		case 'INCLUDED_IN_HIGHER_PLAN':
		case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
			return (
				<FreeProductWithPlanPrice
					showTestCopy={ showTestCopy }
					showDesignUpdate={ showDesignUpdate }
					isMappingProduct={ isMappingProduct }
					domain={ domain }
					translate={ translate }
					rule={ rule }
					price={ price }
					isFeatured={ isFeatured }
				/>
			);
		case 'PRICE':
		default:
			return <DefaultPrice salePrice={ salePrice } price={ price } translate={ translate } />;
	}
}

DomainProductPrice.propTypes = {
	domain: PropTypes.string,
	isEligibleVariantForDomainTest: PropTypes.bool,
	isFeatured: PropTypes.bool,
	isLoading: PropTypes.bool,
	isMappingProduct: PropTypes.bool,
	price: PropTypes.string.isRequired,
	rule: PropTypes.string,
	salePrice: PropTypes.string,
	showDesignUpdate: PropTypes.bool,
	showTestCopy: PropTypes.bool,
	translate: PropTypes.func.isRequired,
};

function FreeProductPrice( {
	isEligibleVariantForDomainTest,
	showDesignUpdate,
	translate,
	price,
	rule,
	isFeatured,
	domain,
} ) {
	const className = classnames( 'domain-product-price', {
		'domain-product-price__domain-step-copy-updates': isEligibleVariantForDomainTest,
		'domain-product-price__domain-step-design-updates': showDesignUpdate,
	} );

	const productPriceClassName = classnames( 'domain-product-price__price', {
		'domain-product-price__free-price': isEligibleVariantForDomainTest,
		'domain-product-price__free-price-domain-step-design-updates': showDesignUpdate,
	} );

	return (
		<div className={ className }>
			<div className={ productPriceClassName }>
				<span>{ translate( 'Free' ) }</span>
				{ showDesignUpdate && (
					<DomainPricePopoverElement
						price={ price }
						rule={ rule }
						isFeatured={ isFeatured }
						domain={ domain }
						translate={ translate }
					/>
				) }
			</div>
		</div>
	);
}

function FreeProductWithPlanPrice( {
	showTestCopy,
	showDesignUpdate,
	isMappingProduct,
	domain,
	translate,
	rule,
	price,
	isFeatured,
} ) {
	const className = classnames( 'domain-product-price', 'is-free-domain', {
		'domain-product-price__domain-step-copy-updates': showTestCopy,
		'domain-product-price__domain-step-design-updates': showDesignUpdate,
	} );

	return (
		<div className={ className }>
			<FreeWithPlanText
				isMappingProduct={ isMappingProduct }
				showDesignUpdate={ showDesignUpdate }
				domain={ domain }
				translate={ translate }
				rule={ rule }
				price={ price }
				showTestCopy={ showTestCopy }
				isFeatured={ isFeatured }
			/>
			<FreeWithPlanPrice
				isMappingProduct={ isMappingProduct }
				isFeatured={ isFeatured }
				translate={ translate }
				price={ price }
				showDesignUpdate={ showDesignUpdate }
				showTestCopy={ showTestCopy }
			/>
		</div>
	);
}

function DomainPricePopoverElement( { price, rule, isFeatured, domain, translate } ) {
	let popoverText;

	switch ( rule ) {
		case 'FREE_DOMAIN':
			if ( domain && getTld( domain ) === 'blog' ) {
				popoverText = translate(
					'Every WordPress.com blog comes with a free .blog address. {{a}}Learn more{{/a}}.',
					{
						components: {
							a: (
								<a
									href="https://en.support.wordpress.com/domains/#domain-name-overview"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ event => {
										event.stopPropagation();
									} }
								/>
							),
						},
					}
				);
			} else {
				popoverText = translate(
					'Every WordPress.com site comes with a free WordPress.com address. {{a}}Learn more{{/a}}.',
					{
						components: {
							a: (
								<a
									href="https://en.support.wordpress.com/domains/#domain-name-overview"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ event => {
										event.stopPropagation();
									} }
								/>
							),
						},
					}
				);
			}
			break;

		case 'INCLUDED_IN_HIGHER_PLAN':
			popoverText = translate(
				'The registration fee for this domain is free for the first year with the purchase of any paid plan. ' +
					'It will renew for %(cost)s / year after that. {{a}}Learn more{{/a}}.',
				{
					args: { cost: price },
					components: {
						a: (
							<a
								href="https://en.support.wordpress.com/domains/domain-pricing-and-available-tlds/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ event => {
									event.stopPropagation();
								} }
							/>
						),
					},
				}
			);
			break;
	}

	if ( ! popoverText ) {
		return;
	}

	return (
		! isFeatured && (
			<InfoPopover
				iconSize={ 22 }
				position={ 'left' }
				className="domain-product-price__free-text-tooltip"
			>
				{ popoverText }
			</InfoPopover>
		)
	);
}

function FreeWithPlanText( {
	isMappingProduct,
	showDesignUpdate,
	domain,
	translate,
	rule,
	price,
	showTestCopy,
	isFeatured,
} ) {
	let message, popoverElement;
	switch ( rule ) {
		case 'FREE_WITH_PLAN':
			message = translate( 'First year free with your plan' );
			if ( isMappingProduct ) {
				message = translate( 'Free with your plan' );
			}
			break;
		case 'INCLUDED_IN_HIGHER_PLAN':
			if ( showTestCopy ) {
				message = translate( 'Registration fee: {{del}}%(cost)s{{/del}} {{span}}Free{{/span}}', {
					args: { cost: price },
					components: {
						del: <del />,
						span: <span className="domain-product-price__free-price" />,
					},
				} );
			} else if ( showDesignUpdate ) {
				message = translate( '{{del}}%(cost)s{{/del}} {{span}}Free with a paid plan{{/span}}', {
					args: { cost: price },
					components: {
						del: <del />,
						span: <span className="domain-product-price__free-price" />,
					},
				} );
				popoverElement = (
					<DomainPricePopoverElement
						price={ price }
						rule={ rule }
						isFeatured={ isFeatured }
						domain={ domain }
						translate={ translate }
					/>
				);
			} else {
				message = translate( 'First year included in paid plans' );
			}

			if ( isMappingProduct ) {
				message = translate( 'Included in paid plans' );
			}
			break;
		case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
			message = translate( 'Personal plan required' );
			break;
	}

	const className = classnames( 'domain-product-price__free-text', {
		'domain-product-price__free-text-domain-step-design-updates': showDesignUpdate,
	} );

	return (
		<div className={ className }>
			{ message }
			{ popoverElement }
		</div>
	);
}

function FreeWithPlanPrice( {
	isMappingProduct,
	isFeatured,
	translate,
	price,
	showDesignUpdate,
	showTestCopy,
} ) {
	if ( isMappingProduct ) {
		return null;
	}

	let priceText;
	if ( showTestCopy ) {
		priceText = translate( 'Renews at %(cost)s / year', {
			args: { cost: price },
		} );
	} else if ( showDesignUpdate ) {
		if ( isFeatured ) {
			priceText = translate( 'Renews at %(cost)s / year. {{a}}Learn more{{/a}}.', {
				args: { cost: price },
				components: {
					a: (
						<a
							href="https://en.support.wordpress.com/domains/domain-pricing-and-available-tlds/"
							target="_blank"
							rel="noopener noreferrer"
							onClick={ event => {
								event.stopPropagation();
							} }
						/>
					),
				},
			} );
		}
	} else {
		priceText = translate( 'Renewal: %(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> },
		} );
	}

	return priceText && <div className="domain-product-price__price">{ priceText }</div>;
}

function SalePrice( { price, salePrice, translate } ) {
	return (
		<div className="domain-product-price is-free-domain">
			<div className="domain-product-price__sale-price">{ salePrice }</div>
			<div className="domain-product-price__renewal-price">
				{ translate( 'Renews at: %(cost)s {{small}}/year{{/small}}', {
					args: { cost: price },
					components: { small: <small /> },
				} ) }
			</div>
		</div>
	);
}

function DefaultPrice( { salePrice, price, translate } ) {
	if ( salePrice ) {
		return <SalePrice price={ price } salePrice={ salePrice } translate={ translate } />;
	}

	return (
		<div className="domain-product-price">
			<span className="domain-product-price__price">
				{ translate( '%(cost)s {{small}}/year{{/small}}', {
					args: { cost: price },
					components: { small: <small /> },
				} ) }
			</span>
		</div>
	);
}

export default localize( DomainProductPrice );
