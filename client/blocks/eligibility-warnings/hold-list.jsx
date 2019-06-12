/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { localizeUrl } from 'lib/i18n-utils';

// Mapping eligibility holds to messages that will be shown to the user
// TODO: update supportUrls and maybe create similar mapping for warnings
function getHoldMessages( siteSlug, translate ) {
	return {
		TRANSFER_ALREADY_EXISTS: {
			title: translate( 'Installation in progress' ),
			description: translate( 'Please wait for installation to complete and try again.' ),
		},
		NO_JETPACK_SITES: {
			title: translate( 'Not available for Jetpack sites' ),
			description: translate( 'Try using a different site.' ),
		},
		NO_VIP_SITES: {
			title: translate( 'Not available for VIP sites' ),
			description: translate( 'Try using a different site.' ),
		},
		SITE_PRIVATE: {
			title: translate( 'Public site needed' ),
			description: translate(
				'Change your site\'s Privacy settings to "Public" or "Hidden" (not "Private") to clear this issue.'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/settings/privacy-settings/' ),
		},
		SITE_GRAYLISTED: {
			title: translate( 'Ongoing site dispute' ),
			description: translate(
				"Contact us to review your site's standing and resolve the dispute to clear this issue."
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/suspended-blogs/' ),
		},
		NON_ADMIN_USER: {
			title: translate( 'Site owned by a different user' ),
			description: translate( 'Only the site owner can use this feature.' ),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/user-roles/' ),
		},
		NOT_DOMAIN_OWNER: {
			title: translate( 'Domain owned by a different user' ),
			description: translate(
				'The primary domain is owned by a different user. Change the primary domain, or contact support to transfer the primary domain to yourself to clear this issue.'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/domains/' ),
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'Domain should use WordPress.com name servers' ),
			description: translate(
				'Set your domain to use WordPress.com name servers to clear this issue. Contact your domain provider for more information about changing name servers.'
			),
			supportUrl:
				'https://en.support.wordpress.com/domains/map-existing-domain/' +
				'#2-ask-your-domain-provider-to-update-your-dns-settings',
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Domain should point to WordPress.com' ),
			description: translate(
				"Your domain is not pointing to your WordPress.com site. Reset your domain's A records to clear this issue."
			),
			supportUrl: localizeUrl(
				'https://en.support.wordpress.com/move-domain/setting-custom-a-records/'
			),
		},
		NO_SSL_CERTIFICATE: {
			title: translate( 'Certificate installation in progress' ),
			description: translate(
				'We are setting up a digital certificate to allow secure browsing on your site using "HTTPS". Please try again in a few minutes.'
			),
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Confirm your email address' ),
			description: translate(
				'We sent you a link to confirm your email address when you signed up. Check your email and click the link to confirm your address and clear this issue.'
			),
		},
		EXCESSIVE_DISK_SPACE: {
			title: translate( 'Upload not available' ),
			description: translate(
				'This site is not currently eligible for installing themes and plugins. Please contact support to clear this issue.'
			),
			supportUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
	};
}

export const HoldList = ( { holds, isPlaceholder, siteSlug, translate } ) => {
	const holdMessages = getHoldMessages( siteSlug, translate );

	return (
		<div>
			<SectionHeader
				label={ translate( 'Please resolve this issue:', 'Please resolve these issues:', {
					count: holds.length,
				} ) }
			/>
			<Card className="eligibility-warnings__hold-list">
				{ isPlaceholder && (
					<div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message" />
						</div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message" />
						</div>
					</div>
				) }
				{ ! isPlaceholder &&
					map( holds, hold => (
						<div className="eligibility-warnings__hold" key={ hold }>
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message">
								<span className="eligibility-warnings__message-title">
									{ holdMessages[ hold ].title }
								</span>
								:&nbsp;
								<span className="eligibility-warnings__message-description">
									{ holdMessages[ hold ].description }
								</span>
							</div>
							{ holdMessages[ hold ].supportUrl && (
								<div className="eligibility-warnings__action">
									<Button
										compact
										href={ holdMessages[ hold ].supportUrl }
										rel="noopener noreferrer"
									>
										{ translate( 'Learn More' ) }
									</Button>
								</div>
							) }
						</div>
					) ) }
			</Card>
		</div>
	);
};

export default localize( HoldList );
