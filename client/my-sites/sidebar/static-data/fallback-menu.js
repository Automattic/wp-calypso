import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
/* eslint-disable jsdoc/require-param */
/**
 * Fallback nav menu items.
 *
 * These are used as a fallback to ensure that if the API response for menu items
 * fails, the user always sees some menu items. They are required only in the
 * following circumstances:
 *
 * 1. The user has loaded the site for the first time and the Menus API response
 * has yet to be returned or cached in the Browser Storage APIs.
 *
 * 2. The Menu API REST API response fails and there is no response cached in the
 * Browser Storage.
 *
 * As a result of these conditions being an edge case, in most cases the user will
 * not see these menus items. They are a safe guard in case of error.
 *
 * As a rule the menu items are intended to be as close to the anticipated Menus API
 * response as possible but we should not take this too far. We need only show the bear
 * minimum required to navigate in the case that the API response fails.
 */
/* eslint-enable jsdoc/require-param */

const JETPACK_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 40 40' %3E%3Cpath fill='%23a0a5aa' d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm11 17H21v19l10-19zM19 4L9 23h10V4z'/%3E%3C/svg%3E`;
const WOOCOMMERCE_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGZpbGw9IiNhMmFhYjIiIGQ9Ik02MTIuMTkyIDQyNi4zMzZjMC02Ljg5Ni0zLjEzNi01MS42LTI4LTUxLjYtMzcuMzYgMC00Ni43MDQgNzIuMjU2LTQ2LjcwNCA4Mi42MjQgMCAzLjQwOCAzLjE1MiA1OC40OTYgMjguMDMyIDU4LjQ5NiAzNC4xOTItLjAzMiA0Ni42NzItNzIuMjg4IDQ2LjY3Mi04OS41MnptMjAyLjE5MiAwYzAtNi44OTYtMy4xNTItNTEuNi0yOC4wMzItNTEuNi0zNy4yOCAwLTQ2LjYwOCA3Mi4yNTYtNDYuNjA4IDgyLjYyNCAwIDMuNDA4IDMuMDcyIDU4LjQ5NiAyNy45NTIgNTguNDk2IDM0LjE5Mi0uMDMyIDQ2LjY4OC03Mi4yODggNDYuNjg4LTg5LjUyek0xNDEuMjk2Ljc2OGMtNjguMjI0IDAtMTIzLjUwNCA1NS40ODgtMTIzLjUwNCAxMjMuOTJ2NjUwLjcyYzAgNjguNDMyIDU1LjI5NiAxMjMuOTIgMTIzLjUwNCAxMjMuOTJoMzM5LjgwOGwxMjMuNTA0IDEyMy45MzZWODk5LjMyOGgyNzguMDQ4YzY4LjIyNCAwIDEyMy41Mi01NS40NzIgMTIzLjUyLTEyMy45MnYtNjUwLjcyYzAtNjguNDMyLTU1LjI5Ni0xMjMuOTItMTIzLjUyLTEyMy45MmgtNzQxLjM2em01MjYuODY0IDQyMi4xNmMwIDU1LjA4OC0zMS4wODggMTU0Ljg4LTEwMi42NCAxNTQuODgtNi4yMDggMC0xOC40OTYtMy42MTYtMjUuNDI0LTYuMDE2LTMyLjUxMi0xMS4xNjgtNTAuMTkyLTQ5LjY5Ni01Mi4zNTItNjYuMjU2IDAgMC0zLjA3Mi0xNy43OTItMy4wNzItNDAuNzUyIDAtMjIuOTkyIDMuMDcyLTQ1LjMyOCAzLjA3Mi00NS4zMjggMTUuNTUyLTc1LjcyOCA0My41NTItMTA2LjczNiA5Ni40NDgtMTA2LjczNiA1OS4wNzItLjAzMiA4My45NjggNTguNTI4IDgzLjk2OCAxMTAuMjA4ek00ODYuNDk2IDMwMi40YzAgMy4zOTItNDMuNTUyIDE0MS4xNjgtNDMuNTUyIDIxMy40MjR2NzUuNzEyYy0yLjU5MiAxMi4wOC00LjE2IDI0LjE0NC0yMS44MjQgMjQuMTQ0LTQ2LjYwOCAwLTg4Ljg4LTE1MS40NzItOTIuMDE2LTE2MS44NC02LjIwOCA2Ljg5Ni02Mi4yNCAxNjEuODQtOTYuNDQ4IDE2MS44NC0yNC44NjQgMC00My41NTItMTEzLjY0OC00Ni42MDgtMTIzLjkzNkMxNzYuNzA0IDQzNi42NzIgMTYwIDMzNC4yMjQgMTYwIDMyNy4zMjhjMC0yMC42NzIgMS4xNTItMzguNzM2IDI2LjA0OC0zOC43MzYgNi4yMDggMCAyMS42IDYuMDY0IDIzLjcxMiAxNy4xNjggMTEuNjQ4IDYyLjAzMiAxNi42ODggMTIwLjUxMiAyOS4xNjggMTg1Ljk2OCAxLjg1NiAyLjkyOCAxLjUwNCA3LjAwOCA0LjU2IDEwLjQzMiAzLjE1Mi0xMC4yODggNjYuOTI4LTE2OC43ODQgOTQuOTYtMTY4Ljc4NCAyMi41NDQgMCAzMC40IDQ0LjU5MiAzMy41MzYgNjEuODI0IDYuMjA4IDIwLjY1NiAxMy4wODggNTUuMjE2IDIyLjQxNiA4Mi43NTIgMC0xMy43NzYgMTIuNDgtMjAzLjEyIDY1LjM5Mi0yMDMuMTIgMTguNTkyLjAzMiAyNi43MDQgNi45MjggMjYuNzA0IDI3LjU2OHpNODcwLjMyIDQyMi45MjhjMCA1NS4wODgtMzEuMDg4IDE1NC44OC0xMDIuNjQgMTU0Ljg4LTYuMTkyIDAtMTguNDQ4LTMuNjE2LTI1LjQyNC02LjAxNi0zMi40MzItMTEuMTY4LTUwLjE3Ni00OS42OTYtNTIuMjg4LTY2LjI1NiAwIDAtMy44ODgtMTcuOTItMy44ODgtNDAuODk2czMuODg4LTQ1LjE4NCAzLjg4OC00NS4xODRjMTUuNTUyLTc1LjcyOCA0My40ODgtMTA2LjczNiA5Ni4zODQtMTA2LjczNiA1OS4xMDQtLjAzMiA4My45NjggNTguNTI4IDgzLjk2OCAxMTAuMjA4eiIvPjwvc3ZnPg==`;

export default function buildFallbackResponse( {
	siteDomain = '',
	shouldShowMailboxes = false,
	shouldShowLinks = false,
	shouldShowTestimonials = false,
	shouldShowPortfolio = false,
	shouldShowWooCommerce = false,
	shouldShowThemes = false,
	shouldShowApperanceHeader = false,
	shouldShowApperanceBackground = false,
	shouldShowAdControl = false,
	shouldShowAddOns = false,
	showSiteMonitoring = false,
	showGithubDeployments = false,
} = {} ) {
	const fallbackResponse = [
		{
			icon: 'dashicons-admin-home',
			slug: 'home',
			title: translate( 'My Home' ),
			type: 'menu-item',
			url: `/home/${ siteDomain }`,
		},
		{
			slug: 'Plans',
			title: translate( 'Plans' ),
			type: 'submenu-item',
			icon: 'dashicons-cart',
			url: `/plans/${ siteDomain }`,
		},
		...( shouldShowAddOns
			? [
					{
						slug: 'Add-Ons',
						title: translate( 'Add-Ons' ),
						type: 'submenu-item',
						url: `/add-ons/${ siteDomain }`,
					},
			  ]
			: [] ),
		{
			slug: 'Domains',
			title: translate( 'Domains' ),
			type: 'submenu-item',
			icon: 'dashicons-admin-site',
			url: `/domains/manage/${ siteDomain }`,
		},
		{
			slug: 'Emails',
			title: translate( 'Emails' ),
			type: 'submenu-item',
			url: `/email/${ siteDomain }`,
			icon: 'dashicons-email',
		},
		{
			slug: 'Purchases',
			title: translate( 'Purchases' ),
			type: 'submenu-item',
			icon: 'dashicons-money-alt',
			url: `/purchases/subscriptions/${ siteDomain }`,
		},
		{
			slug: 'options-hosting-configuration-php',
			// icon: 'dashicons-admin-generic',
			title: translate( 'Hosting' ),
			type: 'submenu-item',
			url: `/hosting-config/${ siteDomain }`,
		},
		{
			// icon: 'dashicons-admin-tools',
			slug: 'options-general-php',
			title: translate( 'Site Tools' ),
			type: 'menu-item',
			url: `/settings/general/${ siteDomain }`,
		},
		...( showSiteMonitoring
			? [
					{
						slug: 'tools-site-monitoring',
						title: translate( 'Site Monitoring' ),
						type: 'submenu-item',
						// icon: 'dashicons-visibility',
						url: `/site-monitoring/${ siteDomain }`,
					},
			  ]
			: [] ),
		{
			parent: 'jetpack',
			slug: 'tools-earn',
			title: translate( 'Monetize' ),
			type: 'menu-item',
			url: `/earn/${ siteDomain }`,
		},
		{
			parent: 'jetpack',
			slug: 'options-podcasting-php',
			title: translate( 'Podcasting' ),
			type: 'submenu-item',
			url: `/settings/podcasting/${ siteDomain }`,
		},
		{
			parent: 'jetpack',
			slug: 'options-podcasting-php',
			title: translate( 'Subscribers' ),
			type: 'submenu-item',
			url: `/users/subscribers/${ siteDomain }`,
		},
	];

	return fallbackResponse;
}
