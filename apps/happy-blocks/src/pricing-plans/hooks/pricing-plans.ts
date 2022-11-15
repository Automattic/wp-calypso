import formatCurrency from '@automattic/format-currency';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import config from '../config';
import { ApiPricingPlan, PricingPlansConfiguration } from '../types.js';

const DAYS_IN_MONTH = 31;
const MONTHS_IN_YEAR = 12;

/**
 * Returns a formatted motnhly price for a plan.
 */
const getMonthlyPrice = ( plan: ApiPricingPlan ): string | null => {
	return formatCurrency(
		Math.round( ( plan.raw_price / plan.bill_period ) * DAYS_IN_MONTH ),
		plan.currency_code,
		{
			stripZeros: true,
		}
	);
};

/**
 * Returns a description of the savings of the yearly plan over the monthly plan.
 */
const getSavingsDescription = (
	yearlyPlan: ApiPricingPlan,
	monthyPlan: ApiPricingPlan
): string => {
	const yearlyPricePerMonth = yearlyPlan.raw_price / MONTHS_IN_YEAR;
	const savings = Math.round( 100 - ( yearlyPricePerMonth / monthyPlan.raw_price ) * 100 );

	if ( savings <= 0 ) {
		return '';
	}

	// eslint-disable-next-line @wordpress/valid-sprintf
	return sprintf(
		// translators: %s is a percentage, e.g. "16%"
		__( 'save %s%%', 'happy-blocks' ),
		savings
	);
};

/**
 * Parse the API response into a more usable format.
 */
const parsePlans = ( data: ApiPricingPlan[] ): PricingPlansConfiguration | null => {
	const premiumYearly = data.find( ( plan ) => plan.path_slug === 'premium' );
	const premiumMonthly = data.find( ( plan ) => plan.path_slug === 'premium-monthly' );

	const businessYearly = data.find( ( plan ) => plan.path_slug === 'business' );
	const businessMonthly = data.find( ( plan ) => plan.path_slug === 'business-monthly' );

	const eCommerceYearly = data.find( ( plan ) => plan.path_slug === 'ecommerce' );
	const eCommerceMonthly = data.find( ( plan ) => plan.path_slug === 'ecommerce-monthly' );

	if (
		! premiumYearly ||
		! premiumMonthly ||
		! businessYearly ||
		! businessMonthly ||
		! eCommerceYearly ||
		! eCommerceMonthly
	) {
		return null;
	}

	return {
		premium: {
			label: __( 'Premium', 'happy-blocks' ),
			domain: sprintf(
				// translators: %s is a domain name, e.g. "example.wordpress.com"
				__( 'For %s', 'happy-blocks' ),
				config.domain
			),
			description: __(
				'<p>Build a unique website with advanced design tools.</p><p><learnMore>Learn more.</learnMore></p>',
				'happy-blocks'
			),
			learnMoreLink: `https://wordpress.com/plans/${ config.domain }`,
			upgradeLabel: __( 'Upgrade to Premium', 'happy-tools' ),
			billing: [
				{
					label: __( 'Monthly', 'happy-blocks' ),
					price: getMonthlyPrice( premiumMonthly ) ?? '',
					period: __( 'month', 'happy-blocks' ),
					planSlug: premiumMonthly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ premiumMonthly.path_slug }`,
				},
				{
					label: sprintf(
						// translators: %s is a promotional string, e.g. "save 16%"
						__( 'Annually <promo>%s</promo>', 'happy-blocks' ),
						getSavingsDescription( premiumYearly, premiumMonthly )
					),
					price: getMonthlyPrice( premiumYearly ) ?? '',
					period: __( 'month billed annually', 'happy-blocks' ),
					planSlug: premiumYearly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ premiumYearly.path_slug }`,
				},
			],
		},
		business: {
			label: __( 'Business', 'happy-blocks' ),
			domain: sprintf(
				// translators: %s is a domain name, e.g. "example.wordpress.com"
				__( 'For %s', 'happy-blocks' ),
				config.domain
			),
			description: __(
				'<p>Power your business website with custom plugins and themes.</p><p><learnMore>Learn more.</learnMore></p>',
				'happy-blocks'
			),
			learnMoreLink: `https://wordpress.com/plans/${ config.domain }`,
			upgradeLabel: __( 'Upgrade to Business', 'happy-tools' ),
			billing: [
				{
					label: __( 'Monthly', 'happy-blocks' ),
					price: getMonthlyPrice( businessMonthly ) ?? '',
					period: __( 'month', 'happy-blocks' ),
					planSlug: businessMonthly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ businessMonthly.path_slug }`,
				},
				{
					label: sprintf(
						// translators: %s is a promotional string, e.g. "save 16%"
						__( 'Annually <promo>%s</promo>', 'happy-blocks' ),
						getSavingsDescription( businessYearly, businessMonthly )
					),
					price: getMonthlyPrice( businessYearly ) ?? '',
					period: __( 'month billed annually', 'happy-blocks' ),
					planSlug: businessYearly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ businessYearly.path_slug }`,
				},
			],
		},
		ecommerce: {
			label: __( 'Commerce', 'happy-blocks' ),
			domain: sprintf(
				// translators: %s is a domain name, e.g. "example.wordpress.com"
				__( 'For %s', 'happy-blocks' ),
				config.domain
			),
			description: __(
				'<p>Sell products or services with this powerful, all-in-one online store experience.</p><p><learnMore>Learn more.</learnMore></p>',
				'happy-blocks'
			),
			learnMoreLink: `https://wordpress.com/plans/${ config.domain }`,
			upgradeLabel: __( 'Upgrade to Commerce', 'happy-tools' ),
			billing: [
				{
					label: __( 'Monthly', 'happy-blocks' ),
					price: getMonthlyPrice( eCommerceMonthly ) ?? '',
					period: __( 'month', 'happy-blocks' ),
					planSlug: eCommerceMonthly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ eCommerceMonthly.path_slug }`,
				},
				{
					label: sprintf(
						// translators: %s is a promotional string, e.g. "save 16%"
						__( 'Annually <promo>%s</promo>', 'happy-blocks' ),
						getSavingsDescription( eCommerceYearly, eCommerceMonthly )
					),
					price: getMonthlyPrice( eCommerceYearly ) ?? '',
					period: __( 'month billed annually', 'happy-blocks' ),
					planSlug: eCommerceYearly.path_slug,
					upgradeLink: `https://wordpress.com/checkout/${ config.domain }/${ eCommerceYearly.path_slug }`,
				},
			],
		},
	};
};

/**
 *  This hook is used to fetch the plans data from the API and return a data structure to use through
 *  the rest of the block's component tree.
 */
const usePricingPlans = () => {
	const [ plans, setPlans ] = useState< PricingPlansConfiguration | null >( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< unknown >( null );

	useEffect( () => {
		const fetchPlans = async () => {
			setIsLoading( true );
			setError( null );
			try {
				const response = await fetch(
					`https://public-api.wordpress.com/rest/v1.5/plans?locale=${ config.locale }`
				);
				const data = await response.json();
				setPlans( parsePlans( data ) );
			} catch ( e: unknown ) {
				setError( e );
			} finally {
				setIsLoading( false );
			}
		};

		fetchPlans();
	}, [] );

	return { data: plans, isLoading, error };
};

export default usePricingPlans;
