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
			title: translate( 'Admin access required' ),
			description: translate( 'Only site administrators are allowed to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/user-roles/',
		},
		NOT_DOMAIN_OWNER: {
			title: translate( 'Not a custom domain owner' ),
			description: translate( 'You must be the owner of the primary domain subscription to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/domains/',
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'No WordPress.com name servers' ),
			description: translate( 'Use WordPress.com name servers on your custom domain to resolve.' ),
			supportUrl: 'https://support.wordpress.com/domain-helper/',
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Primary domain not pointing to WordPress.com servers' ),
			description: translate( 'Point your primary domain to WordPress.com servers to resolve.' ),
			supportUrl: 'https://support.wordpress.com/domain-helper/',
		},
		NO_SSL_CERTIFICATE: {
			title: translate( "Primary domain doesn't have a valid SSL certificate" ),
			description: translate(
				'Please try again in a few minutes: you will be able to proceed once we finish setting up your security settings.'
			),
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Unconfirmed email' ),
			description: translate(
				'Please check your email to confirm your address.'
			),
		}
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
