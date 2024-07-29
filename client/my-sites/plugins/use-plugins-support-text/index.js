import { useTranslate } from 'i18n-calypso';

/*
 * Gets text used to describe the support level a user will receive
 * if buying a marketplace plugin for the selected site.
 * Example page: /plugins/woocommerce-subscriptions/<sitename>
 *
 * If pro plan is active and site is eligible:
 *    "Premium Support".
 *
 * If pro plan is inactive/ineligible, and their current plan has the Live Support feature:
 *    "Live chat support 24x7".
 *
 * If pro plan is inactive/ineligible, they have "Annually" selected in the top right,
 * meaning they intend to buy an annual plan:
 *    "Live chat support 24x7".
 *
 * If pro plan is inactive/ineligible, and their current plan does not have the Live
 * Support feature, and they have "monthly" selected in the top right, meaning
 * they intend to buy a monthly plan:
 *   "Unlimited Email Support".
 *
 * We don't know exactly what plan they're going to buy, so we make an assumption that
 * all monthly plans don't have live support and all annual ones do.
 */
export default function usePluginsSupportText() {
	const translate = useTranslate();
	return translate( '24/7 expert support' );
}
