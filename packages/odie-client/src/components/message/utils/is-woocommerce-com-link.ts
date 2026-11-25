/**
 * The Help Center article view can't load WooCommerce.com docs yet (WOOPUBR-2241), and on
 * WooCommerce.com a link that opens in the same tab replaces the page the chat is on.
 */
export const isWooCommerceComLink = ( href: string ) =>
	/^https?:\/\/(?:[\w-]+\.)*woocommerce\.com(?:[/?#:]|$)/i.test( href );

/**
 * Whether the Help Center runs on WooCommerce.com. Only there do chat links open in a new tab:
 * everywhere else they behave as before.
 */
export const isOnWooCommerceCom = () => isWooCommerceComLink( window.location.href );
