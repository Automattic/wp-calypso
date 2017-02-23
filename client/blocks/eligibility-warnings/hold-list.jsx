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
function getHoldMessages( translate ) {
	return {
		PLACEHOLDER: {
			title: '',
			description: '',
			supportUrl: '',
		},
		TRANSFER_ALREADY_EXISTS: {
			title: translate( 'Installation in progress' ),
			description: translate( 'Another installation is already in progress.' ),
			supportUrl: 'https://wordpress.com/help'
		},
		NO_BUSINESS_PLAN: {
			title: translate( 'Business plan required' ),
			description: translate( 'This feature is only allowed on sites with a business plan.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NO_JETPACK_SITES: {
			title: translate( 'Jetpack site' ),
			description: translate( 'This feature is not supported on Jetpack sites.' ),
			supportUrl: 'https://wordpress.com/help'
		},
		NO_VIP_SITES: {
			title: translate( 'VIP site' ),
			description: translate( 'This feature is not supported on VIP sites.' ),
			supportUrl: 'https://wordpress.com/help'
		},
		SITE_PRIVATE: {
			title: translate( 'Private site' ),
			description: translate( 'This feature is not supported on private sites.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		SITE_GRAYLISTED: {
			title: translate( 'Flagged site' ),
			description: translate( 'This feature is not supported on sites that are not in good standing.' ),
			supportUrl: 'https://wordpress.com/help'
		},
		NON_ADMIN_USER: {
			title: translate( 'Admin access required' ),
			description: translate( 'Only site administrators are allowed to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/user-roles/'
		},
		NOT_USING_CUSTOM_DOMAIN: {
			title: translate( 'No custom domain' ),
			description: translate( 'Your site must use a custom domain to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/register-domain/'
		},
		NOT_DOMAIN_OWNER: {
			title: translate( 'Not a custom domain owner' ),
			description: translate( 'You must be the owner of the primary domain subscription to use this feature.' ),
			supportUrl: 'https://support.wordpress.com/domains/'
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'No WordPress.com name servers' ),
			description: translate( 'Your custom domain must point to WordPress.com name servers.' ),
			supportUrl: 'https://support.wordpress.com/domain-helper/'
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Primary domain not pointing to WordPress.com servers' ),
			description: translate( 'Your primary domain must point to WordPress.com servers.' ),
			supportUrl: 'https://support.wordpress.com/domain-helper/'
		},
		NO_SSL_CERTIFICATE: {
			title: translate( 'Primary domain does not have a valid SSL certificate' ),
			description: translate( 'You will be able to proceed once we finish setting up some security settings for the site.' ),
			supportUrl: 'https://wordpress.com/help'
		}
	};
}

export const HoldList = ( {
	holds,
	translate,
} ) => {
	const holdMessages = getHoldMessages( translate );

	return (
		<div>
			<SectionHeader label={ translate(
				'Please resolve this issue:',
				'Please resolve these issues:',
				{ count: holds.length }
			) } />
			<Card className="eligibility-warnings__hold-list">
				{ map( holds, ( hold, index ) =>
					<div className="eligibility-warnings__hold" key={ index }>
						<Gridicon icon="notice-outline" size={ 24 } />
						<div className="eligibility-warnings__message">
							<span className="eligibility-warnings__message-title">
								{ holdMessages[ hold ].title }
							</span>:&nbsp;
							<span className="eligibility-warnings__message-description">
								{ holdMessages[ hold ].description }
							</span>
						</div>
						<div className="eligibility-warnings__action">
							<Button
								compact
								href={ holdMessages[ hold ].supportUrl }
								rel="noopener noreferrer"
								target="_blank"
							>
								{ translate( 'Resolve' ) }
							</Button>
						</div>
					</div>
				) }
			</Card>
		</div>
	);
};

export default localize( HoldList );
