import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_BUSINESS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { usePlans } from '@automattic/data-stores/src/plans';
import {
	BUNDLED_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	PREMIUM_THEME,
} from '@automattic/design-picker';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { Button as LinkButton } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import i18n, { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useBundleSettingsByTheme } from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSelector } from 'calypso/state';
import {
	canUseTheme,
	getThemeType,
	isThemePurchased,
	isMarketplaceThemeSubscribed,
	getMarketplaceThemeSubscriptionPrices,
} from 'calypso/state/themes/selectors';

interface Props {
	canGoToCheckout?: boolean;
	isLockedStyleVariation?: boolean;
	siteId: number | null;
	siteSlug: string | null;
	themeId: string;
}

const ThemeTypeBadgeTooltipUpgradeLink = ( {
	canGoToCheckout,
	children,
	plan,
	siteSlug,
}: {
	canGoToCheckout: boolean;
	children?: React.ReactNode[];
	plan: string;
	siteSlug: string | null;
} ) => {
	if ( ! canGoToCheckout || ! siteSlug ) {
		return <>{ children }</>;
	}

	const goToCheckout = () => {
		recordTracksEvent( 'calypso_theme_tooltip_upgrade_nudge_click', { plan } );

		const params = new URLSearchParams();
		params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

		window.location.href = `/checkout/${ encodeURIComponent(
			siteSlug
		) }/${ plan }?${ params.toString() }`;
	};

	return (
		<LinkButton variant="link" onClick={ () => goToCheckout() }>
			{ children }
		</LinkButton>
	);
};

const ThemeTypeBadgeTooltip = ( {
	canGoToCheckout = true,
	isLockedStyleVariation,
	siteId,
	siteSlug,
	themeId,
}: Props ) => {
	const translate = useTranslate();
	// Using API plans because the updated getTitle() method doesn't take the experiment assignment into account.
	const plans = usePlans();
	const type = useSelector( ( state ) => getThemeType( state, themeId ) );
	const bundleSettings = useBundleSettingsByTheme( themeId );
	const isIncludedCurrentPlan = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);
	const isPurchased = useSelector( ( state ) => {
		if ( ! siteId ) {
			return false;
		}

		if ( isThemePurchased( state, themeId, siteId ) ) {
			return true;
		}

		if ( type === MARKETPLACE_THEME ) {
			return isMarketplaceThemeSubscribed( state, themeId, siteId );
		}

		return false;
	} );
	const subscriptionPrices = useSelector( ( state ) =>
		type === MARKETPLACE_THEME ? getMarketplaceThemeSubscriptionPrices( state, themeId ) : {}
	);

	const isEnglishLocale = useIsEnglishLocale();

	useEffect( () => {
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell-popup',
			theme: themeId,
		} );
	}, [ themeId ] );

	let message;
	if ( isLockedStyleVariation ) {
		message =
			isEnglishLocale ||
			i18n.hasTranslation(
				'Unlock this style, and tons of other features, by upgrading to a %(premiumPlanName)s plan.'
			)
				? translate(
						'Unlock this style, and tons of other features, by upgrading to a %(premiumPlanName)s plan.',
						{ args: { premiumPlanName: plans?.data?.[ PLAN_PREMIUM ]?.productNameShort ?? '' } }
				  )
				: translate(
						'Unlock this style, and tons of other features, by upgrading to a Premium plantest.'
				  );
	} else if ( type === PREMIUM_THEME ) {
		if ( isPurchased ) {
			message = translate( 'You have purchased this theme.' );
		} else if ( isIncludedCurrentPlan ) {
			message =
				isEnglishLocale || i18n.hasTranslation( 'This theme is included in your plan.' )
					? translate( 'This theme is included in your plan.' )
					: translate( 'This premium theme is included in your plan.' );
		} else {
			message = createInterpolateElement(
				isEnglishLocale ||
					i18n.hasTranslation(
						'This theme is included in the <Link>%(premiumPlanName)s plan</Link>.'
					)
					? ( translate( 'This theme is included in the <Link>%(premiumPlanName)s plan</Link>.', {
							args: { premiumPlanName: plans?.data?.[ PLAN_PREMIUM ]?.productNameShort ?? '' },
					  } ) as string )
					: translate( 'This premium theme is included in the <Link>Premium plan</Link>.' ),
				{
					Link: (
						<ThemeTypeBadgeTooltipUpgradeLink
							canGoToCheckout={ canGoToCheckout }
							plan="premium"
							siteSlug={ siteSlug }
						/>
					),
				}
			);
		}
	} else if ( type === DOT_ORG_THEME ) {
		message = isIncludedCurrentPlan
			? translate( 'This community theme is included in your plan.' )
			: createInterpolateElement(
					isEnglishLocale ||
						i18n.hasTranslation(
							'This community theme can only be installed if you have the <Link>%(businessPlanName)s plan</Link> or higher on your site.'
						)
						? ( translate(
								'This community theme can only be installed if you have the <Link>%(businessPlanName)s plan</Link> or higher on your site.',
								{
									args: {
										businessPlanName: plans?.data?.[ PLAN_BUSINESS ]?.productNameShort ?? '',
									},
								}
						  ) as string )
						: translate(
								'This community theme can only be installed if you have the <Link>Business plan</Link> or higher on your site.'
						  ),
					{
						Link: (
							<ThemeTypeBadgeTooltipUpgradeLink
								canGoToCheckout={ canGoToCheckout }
								plan="business"
								siteSlug={ siteSlug }
							/>
						),
					}
			  );
	} else if ( type === BUNDLED_THEME ) {
		if ( bundleSettings ) {
			const bundleName = bundleSettings.name;

			if ( isIncludedCurrentPlan ) {
				// Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special".
				message = translate( 'This %(bundleName)s theme is included in your plan.', {
					args: { bundleName },
				} );
			} else {
				message = createInterpolateElement(
					isEnglishLocale ||
						i18n.hasTranslation(
							'This theme is included in the <Link>%(businessPlanName)s plan</Link>.'
						)
						? translate( 'This theme is included in the <Link>%(businessPlanName)s plan</Link>.', {
								args: {
									bundleName,
									businessPlanName: plans?.data?.[ PLAN_BUSINESS ]?.productNameShort ?? '',
								},
								textOnly: true,
						  } )
						: // Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special".:
						  translate(
								'This %(bundleName)s theme is included in the <Link>Business plan</Link>.',
								{
									args: { bundleName },
									textOnly: true,
								}
						  ),
					{
						Link: (
							<ThemeTypeBadgeTooltipUpgradeLink
								canGoToCheckout={ canGoToCheckout }
								plan="business"
								siteSlug={ siteSlug }
							/>
						),
					}
				);
			}
		}
	} else if ( type === MARKETPLACE_THEME ) {
		if ( isPurchased && isIncludedCurrentPlan ) {
			message =
				isEnglishLocale ||
				i18n.hasTranslation(
					'You have a subscription for this theme, and it will be usable as long as you keep a %(businessPlanName)s plan or higher on your site.'
				)
					? translate(
							'You have a subscription for this theme, and it will be usable as long as you keep a %(businessPlanName)s plan or higher on your site.',
							{ args: { businessPlanName: plans?.data?.[ PLAN_BUSINESS ]?.productNameShort ?? '' } }
					  )
					: translate(
							'You have a subscription for this theme, and it will be usable as long as you keep a Business plan or higher on your site.'
					  );
		} else if ( isPurchased && ! isIncludedCurrentPlan ) {
			message = createInterpolateElement(
				isEnglishLocale ||
					i18n.hasTranslation(
						'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> on your site.'
					)
					? ( translate(
							'You have a subscription for this theme, but it will only be usable if you have the <link>%(businessPlanName)s plan</link> on your site.',
							{ args: { businessPlanName: plans?.data?.[ PLAN_BUSINESS ]?.productNameShort ?? '' } }
					  ) as string )
					: translate(
							'You have a subscription for this theme, but it will only be usable if you have the <link>Business plan</link> on your site.'
					  ),
				{
					link: (
						<ThemeTypeBadgeTooltipUpgradeLink
							canGoToCheckout={ canGoToCheckout }
							plan="business"
							siteSlug={ siteSlug }
						/>
					),
				}
			);
		} else if ( ! isPurchased && isIncludedCurrentPlan ) {
			/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
			message = translate(
				'This theme is only available while your current plan is active and costs %(annualPrice)s per year or %(monthlyPrice)s per month.',
				{
					args: {
						annualPrice: subscriptionPrices.year ?? '',
						monthlyPrice: subscriptionPrices.month ?? '',
					},
				}
			);
		} else if ( ! isPurchased && ! isIncludedCurrentPlan ) {
			message = createInterpolateElement(
				isEnglishLocale ||
					i18n.hasTranslation(
						'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.'
					)
					? /* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
					  ( translate(
							'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>%(businessPlanName)s plan</Link> on your site.',
							{
								args: {
									annualPrice: subscriptionPrices.year ?? '',
									monthlyPrice: subscriptionPrices.month ?? '',
									businessPlanName: plans?.data?.[ PLAN_BUSINESS ]?.productNameShort ?? '',
								},
							}
					  ) as string )
					: ( translate(
							'This theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>Business plan</Link> on your site.',
							{
								args: {
									annualPrice: subscriptionPrices.year ?? '',
									monthlyPrice: subscriptionPrices.month ?? '',
								},
							}
					  ) as string ),
				{
					Link: (
						<ThemeTypeBadgeTooltipUpgradeLink
							canGoToCheckout={ canGoToCheckout }
							plan="business"
							siteSlug={ siteSlug }
						/>
					),
				}
			);
		}
	}

	return <div data-testid="upsell-message">{ message }</div>;
};

export default ThemeTypeBadgeTooltip;
