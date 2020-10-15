/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
} from './constants';
import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from 'calypso/lib/plans/constants';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from 'calypso/lib/products-values/constants';

/**
 * Type dependencies
 */
import type { SelectorProductCopy } from './types';

export function getSelectorProductCopy(
	productSlug: string,
	translate: ReturnType< typeof useTranslate >
): SelectorProductCopy {
	switch ( productSlug ) {
		case PRODUCT_JETPACK_ANTI_SPAM:
		case PRODUCT_JETPACK_ANTI_SPAM_MONTHLY:
			return {
				displayName: translate( 'Jetpack Anti-spam' ),
				shortName: translate( 'Anti-spam', {
					comment: 'Short name of Jetpack Anti-spam',
				} ),
				tagline: translate( 'Block spam automatically' ),
				description: translate(
					'Automated spam protection for comments and forms. Save time, get more responses, and give your visitors a better experience.'
				),
				buttonLabel: translate( 'Get Anti-spam' ),
			};
		case OPTIONS_JETPACK_BACKUP:
		case OPTIONS_JETPACK_BACKUP_MONTHLY:
			return {
				displayName: translate( 'Jetpack Backup' ),
				shortName: translate( 'Backup', {
					comment: 'Short name of the Jetpack Backup generic product',
				} ),
				tagline: translate( 'Recommended for all sites' ),
				description: translate(
					'Never lose a word, image, page, or time worrying about your site. {{em}}Available options: Real-time or Daily.{{/em}}',
					{
						components: {
							em: <em />,
						},
					}
				),
				buttonLabel: translate( 'Get Backup' ),
			};
		case PRODUCT_JETPACK_BACKUP_DAILY:
		case PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY:
			return {
				displayName: translate( 'Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ),
				shortName: translate( 'Backup Daily', {
					comment: 'Short name of the Jetpack Backup Daily product',
				} ),
				tagline: translate( 'Best for sites with occasional updates' ),
				description: translate(
					'Never lose a word, image, page, or time worrying about your site.'
				),
				buttonLabel: translate( 'Get Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ),
			};

		case PRODUCT_JETPACK_BACKUP_REALTIME:
		case PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY:
			return {
				displayName: translate( 'Backup {{em}}Real-Time{{/em}}', {
					components: {
						em: <em />,
					},
				} ),
				shortName: translate( 'Backup Real-time', {
					comment: 'Short name of the Jetpack Backup Real-time product',
				} ),
				tagline: translate( 'Best for sites with frequent updates' ),
				description: translate(
					'Real-time backups save every change and one-click restores get you back online quickly.'
				),
				buttonLabel: translate( 'Get Backup {{em}}Real-Time{{/em}}', {
					components: {
						em: <em />,
					},
				} ),
			};
		case PLAN_JETPACK_COMPLETE:
		case PLAN_JETPACK_COMPLETE_MONTHLY:
			return {
				displayName: translate( 'Jetpack Complete' ),
				shortName: translate( 'Complete', {
					comment: 'Short name of Jetpack Complete',
				} ),
				tagline: translate( 'For best-in-class WordPress sites' ),
				description: translate(
					'Superpower your site with everything Jetpack has to offer: real-time security, enhanced search, CRM, and marketing, growth, and design tools.'
				),
				buttonLabel: translate( 'Get Jetpack Complete' ),
			};
		case PRODUCT_JETPACK_CRM:
		case PRODUCT_JETPACK_CRM_MONTHLY:
			return {
				displayName: translate( 'Jetpack CRM' ),
				shortName: translate( 'CRM', {
					comment: 'Short name of the Jetpack CRM',
				} ),
				tagline: translate( 'Manage contacts effortlessly' ),
				description: translate(
					'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits.'
				),
				buttonLabel: translate( 'Get CRM' ),
			};
		case PRODUCT_JETPACK_SCAN:
		case PRODUCT_JETPACK_SCAN_MONTHLY:
			return {
				displayName: translate( 'Jetpack Scan' ),
				shortName: translate( 'Scan', {
					comment: 'Short name of Jetpack Scan',
				} ),
				tagline: translate( 'Protect your site' ),
				description: translate(
					'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
				),
				buttonLabel: translate( 'Get Scan' ),
			};
		case PRODUCT_JETPACK_SEARCH:
		case PRODUCT_JETPACK_SEARCH_MONTHLY:
		case PRODUCT_WPCOM_SEARCH:
		case PRODUCT_WPCOM_SEARCH_MONTHLY:
			return {
				displayName: translate( 'Jetpack Search' ),
				shortName: translate( 'Search', {
					comment: 'Short name of Jetpack Search',
				} ),
				tagline: translate( 'Recommended for sites with lots of products or content' ),
				description: translate(
					'Help your site visitors find answers instantly so they keep reading and buying.'
				),
				buttonLabel: translate( 'Get Search' ),
			};
		case OPTIONS_JETPACK_SECURITY:
		case OPTIONS_JETPACK_SECURITY_MONTHLY:
			return {
				displayName: translate( 'Jetpack Security' ),
				shortName: translate( 'Security', {
					comment: 'Short name of the Jetpack Security generic plan',
				} ),
				tagline: translate( 'Comprehensive WordPress protection' ),
				description: translate(
					'Enjoy the peace of mind of complete site security. ' +
						'Easy-to-use, powerful security tools guard your site, so you can focus on your business. ' +
						'{{em}}Available options: Real-time or Daily.{{/em}}',
					{ components: { em: <em /> } }
				),
				buttonLabel: translate( 'Get Jetpack Security' ),
			};
		case PLAN_JETPACK_SECURITY_DAILY:
		case PLAN_JETPACK_SECURITY_DAILY_MONTHLY:
			return {
				displayName: translate( 'Security {{em}}Daily{{/em}}', { components: { em: <em /> } } ),
				shortName: translate( 'Security Daily', {
					comment: 'Short name of the Jetpack Security Daily plan',
				} ),
				tagline: translate( 'Comprehensive WordPress protection' ),
				description: translate(
					'Enjoy the peace of mind of complete site protection. ' +
						'Great for brochure sites, restaurants, blogs, and resume sites.'
				),
				buttonLabel: translate( 'Get Security {{em}}Daily{{/em}}', { components: { em: <em /> } } ),
			};
		case PLAN_JETPACK_SECURITY_REALTIME:
		case PLAN_JETPACK_SECURITY_REALTIME_MONTHLY:
			return {
				displayName: translate( 'Security {{em}}Real-time{{/em}}', { components: { em: <em /> } } ),
				shortName: translate( 'Security Real-time', {
					comment: 'Short name of the Jetpack Security Real-time plan',
				} ),
				tagline: translate( 'Comprehensive WordPress protection' ),
				description: translate(
					'Additional security for sites with 24/7 activity. ' +
						'Recommended for eCommerce stores, news organizations, and online forums.'
				),
				buttonLabel: translate( 'Get Security {{em}}Real-time{{/em}}', {
					components: { em: <em /> },
				} ),
			};
		default:
			throw `Unknown SelectorProductSlug: ${ productSlug }`;
	}
}
