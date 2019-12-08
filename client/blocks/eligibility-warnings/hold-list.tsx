/**
 * External dependencies
 */
import React from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';
import { map } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { localizeUrl } from 'lib/i18n-utils';

// Mapping eligibility holds to messages that will be shown to the user
// TODO: update supportUrls and maybe create similar mapping for warnings
function getHoldMessages( translate: LocalizeProps[ 'translate' ] ) {
	return {
		BLOCKED_ATOMIC_TRANSFER: {
			title: translate( 'Blocked' ),
			description: translate(
				'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
			),
			supportUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
		TRANSFER_ALREADY_EXISTS: {
			title: translate( 'Installation in progress' ),
			description: translate(
				'Just a minute! Please wait until the installation is finished, then try again.'
			),
			supportUrl: null,
		},
		NO_BUSINESS_PLAN: {
			title: translate( 'Upgrade to a Business plan' ),
			description: translate(
				"You'll also get to install custom themes, have more storage, and access live support."
			),
			supportUrl: null,
		},
		NO_JETPACK_SITES: {
			title: translate( 'Not available for Jetpack sites' ),
			description: translate( 'Try using a different site.' ),
			supportUrl: null,
		},
		NO_VIP_SITES: {
			title: translate( 'Not available for VIP sites' ),
			description: translate( 'Try using a different site.' ),
			supportUrl: null,
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
			title: translate( 'Site administrator only' ),
			description: translate( 'Only the site administrators can use this feature.' ),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/user-roles/' ),
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
			supportUrl: null,
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Confirm your email address' ),
			description: translate(
				"Check your email for a message we sent you when you signed up. Click the link inside to confirm your email address. You may have to check your email client's spam folder."
			),
			supportUrl: null,
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

interface ExternalProps {
	holds: string[];
	isPlaceholder: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const HoldList = ( { holds, isPlaceholder, translate }: Props ) => {
	const holdMessages = getHoldMessages( translate );

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
					map( holds, hold =>
						! isKnownHoldType( hold, holdMessages ) ? null : (
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
						)
					) }
			</Card>
		</div>
	);
};

function isKnownHoldType(
	hold: string,
	holdMessages: ReturnType< typeof getHoldMessages >
): hold is keyof ReturnType< typeof getHoldMessages > {
	return holdMessages.hasOwnProperty( hold );
}

export default localize( HoldList );
