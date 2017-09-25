/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

// Mapping eligibility holds to messages that will be shown to the user
// TODO: update supportUrls and maybe create similar mapping for warnings
function getHoldMessages( siteSlug, translate ) {
	return {
		TRANSFER_ALREADY_EXISTS: {
			title: translate( 'Installation in progress' ),
			description: translate( 'Please wait for the other installation to complete, then try again.' ),
			supportUrl: 'https://wordpress.com/help',
		},
		NO_JETPACK_SITES: {
			title: translate( 'Jetpack site not supported' ),
			description: translate( 'Try using a different site.' ),
		},
		NO_VIP_SITES: {
			title: translate( 'VIP site not supported' ),
			description: translate( 'Try using a different site.' ),
		},
		SITE_PRIVATE: {
			title: translate( 'Private site not supported' ),
			description: translate( 'Make your site public or hidden to resolve.' ),
			supportUrl: `/settings/general/${ siteSlug }`,
		},
		SITE_GRAYLISTED: {
			title: translate( 'Flagged site not supported' ),
			description: translate( "Contact us to review your site's standing to resolve." ),
			supportUrl: 'https://support.wordpress.com/suspended-blogs/',
		},
		NON_ADMIN_USER: {
			title: translate( 'Site owner access required' ),
			description: translate( 'Only site owners are allowed to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/user-roles/',
		},
		NOT_DOMAIN_OWNER: {
			title: translate( 'Not a custom domain owner' ),
			description: translate( 'You must be the owner of the primary domain subscription to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/domains/',
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'Domain not using WordPress.com name servers' ),
			description: translate( 'Your domain must use WordPress.com name servers to support custom code. ' +
			'Ask your domain provider to update your DNS settings.' ),
			supportUrl: 'https://en.support.wordpress.com/domains/map-existing-domain/' +
			'#2-ask-your-domain-provider-to-update-your-dns-settings',
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Domain not pointing to WordPress.com servers' ),
			description: translate( 'We cannot manage your site because your domain does not point to WordPress.com servers. ' +
			'Follow the instructions to reset your domain\'s A records to resolve this.' ),
			supportUrl: 'https://support.wordpress.com/move-domain/setting-custom-a-records/',
		},
		NO_SSL_CERTIFICATE: {
			title: translate( 'Security certificate required' ),
			description: translate(
				'We are setting up a security certificate for your domain now. Please try again in a few minutes.'
			),
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Unconfirmed email' ),
			description: translate(
				'You must have verified your email address with WordPress.com to install custom code. ' +
				'Please check your email to confirm your address.'
			),
		},
		EXCESSIVE_DISK_SPACE: {
			title: translate( 'We can\'t proceed with this upload' ),
			description: translate(
				'This site is not currently eligible for installing themes and plugins. Please contact support to straighten things out.'
			),
			supportUrl: 'https://support.wordpress.com/help-support-options/',
		},
	};
}

export const HoldList = ( {
	holds,
	isPlaceholder,
	siteSlug,
	translate,
} ) => {
	const holdMessages = getHoldMessages( siteSlug, translate );

	return (
		<div>
			<SectionHeader label={ translate(
				'Please resolve this issue:',
				'Please resolve these issues:',
				{ count: holds.length }
			) } />
			<Card className="eligibility-warnings__hold-list">
				{ isPlaceholder &&
					<div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message"></div>
						</div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message"></div>
						</div>
					</div>
				}
				{ ! isPlaceholder && map( holds, hold =>
					<div className="eligibility-warnings__hold" key={ hold }>
						<Gridicon icon="notice-outline" size={ 24 } />
						<div className="eligibility-warnings__message">
							<span className="eligibility-warnings__message-title">
								{ holdMessages[ hold ].title }
							</span>:&nbsp;
							<span className="eligibility-warnings__message-description">
								{ holdMessages[ hold ].description }
							</span>
						</div>
						{ holdMessages[ hold ].supportUrl &&
							<div className="eligibility-warnings__action">
								<Button
									compact
									href={ holdMessages[ hold ].supportUrl }
									rel="noopener noreferrer"
								>
									{ translate( 'Resolve' ) }
								</Button>
							</div>
						}
					</div>
				) }
			</Card>
		</div>
	);
};

export default localize( HoldList );
