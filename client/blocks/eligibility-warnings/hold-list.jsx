/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import Gridicon from 'components/gridicon';

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
			description: translate(
				'Just a minute! Please wait until the installation is finished, then try again.'
			),
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
				'Change your site\'s Privacy settings to "Public" or "Hidden" (not "Private.")'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/settings/privacy-settings/' ),
		},
		SITE_GRAYLISTED: {
			title: translate( 'Ongoing site dispute' ),
			description: translate(
				"Contact us to review your site's standing and resolve the dispute."
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/suspended-blogs/' ),
		},
		NON_ADMIN_USER: {
			title: translate( 'Site owner only' ),
			description: translate( 'Only the site owner can use this feature.' ),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/user-roles/' ),
		},
		NOT_DOMAIN_OWNER: {
			title: translate( 'Domain owner only' ),
			description: translate(
				'The primary domain on this site is owned by a different user. Change the primary domain to one that you own, or contact support to have this domain transferred to you.'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/domains/' ),
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'Domain not using WordPress.com name servers' ),
			description: translate(
				"This domain is not using WordPress.com name servers, so it's not pointing to your site. Change your name servers over at your domain provider's. If you're not sure how to do that, contact them for help."
			),
			supportUrl:
				'https://en.support.wordpress.com/domains/map-existing-domain/' +
				'#2-ask-your-domain-provider-to-update-your-dns-settings',
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Domain pointing to a different site' ),
			description: translate(
				"Your domain is not properly set up to point to your site. Reset your domain's A records in the Domains section to fix this."
			),
			supportUrl: localizeUrl(
				'https://en.support.wordpress.com/move-domain/setting-custom-a-records/'
			),
		},
		NO_SSL_CERTIFICATE: {
			title: translate( 'Certificate installation in progress' ),
			description: translate(
				'Hold tight! We are setting up a digital certificate to allow secure browsing on your site, using "HTTPS". Please try again in a few minutes.'
			),
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Confirm your email address' ),
			description: translate(
				"Check your email for a message we sent you when you signed up. Click the link inside to confirm your email address. You may have to check your email client's spam folder."
			),
		},
		EXCESSIVE_DISK_SPACE: {
			title: translate( 'Upload not available' ),
			description: translate(
				'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
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
										{ translate( 'Help' ) }
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
