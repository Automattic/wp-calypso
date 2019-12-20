/**
 * External dependencies
 */
import classNames from 'classnames';
import i18n, { localize, LocalizeProps } from 'i18n-calypso';
const hasTranslation = ( message: string ) => i18n.hasTranslation( message );
import { identity, map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { localizeUrl } from 'lib/i18n-utils';

// Mapping eligibility holds to messages that will be shown to the user
function getHoldMessages( context: string | null, translate: LocalizeProps[ 'translate' ] ) {
	return {
		NO_BUSINESS_PLAN: {
			title: hasTranslation( 'Upgrade to a Business plan' )
				? translate( 'Upgrade to a Business plan' )
				: translate( 'Upgrade to Business' ),
			description: ( function() {
				if ( context === 'themes' ) {
					return hasTranslation(
						"You'll also get to install custom plugins, have more storage, and access live support."
					)
						? translate(
								"You'll also get to install custom plugins, have more storage, and access live support."
						  )
						: translate(
								'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
						  );
				}

				return hasTranslation(
					"You'll also get to install custom themes, have more storage, and access live support."
				)
					? translate(
							"You'll also get to install custom themes, have more storage, and access live support."
					  )
					: translate(
							'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
					  );
			} )(),
			supportUrl: null,
		},
		SITE_PRIVATE: {
			title: translate( 'Public site needed' ),
			description: translate(
				'Change your site\'s Privacy settings to "Public" or "Hidden" (not "Private.")'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/settings/privacy-settings/' ),
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

/**
 * This function defines how we should communicate each type of blocking hold the public-api returns.
 * Blocking holds are "hard stops" - if we detect any, we know the Atomic Transfer won't be possible and so we
 * should short-circuit any eligibility checks and just communicate the problem.
 *
 * @param {Function} translate Translate fn
 * @returns {object} Dictionary of blocking holds and their corresponding messages
 */
function getBlockingMessages( translate: LocalizeProps[ 'translate' ] ) {
	return {
		BLOCKED_ATOMIC_TRANSFER: {
			message: hasTranslation(
				'This site is not currently eligible to install themes and plugins, or activate hosting access. Please contact our support team for help.'
			)
				? translate(
						'This site is not currently eligible to install themes and plugins, or activate hosting access. Please contact our support team for help.'
				  )
				: translate(
						'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
				  ),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
		TRANSFER_ALREADY_EXISTS: {
			message: translate(
				'Installation in progress. Just a minute! Please wait until the installation is finished, then try again.'
			),
			status: null,
			contactUrl: null,
		},
		NO_JETPACK_SITES: {
			message: translate( 'Try using a different site.' ),
			status: 'is-error',
			contactUrl: null,
		},
		NO_VIP_SITES: {
			message: translate( 'Try using a different site.' ),
			status: 'is-error',
			contactUrl: null,
		},
		SITE_GRAYLISTED: {
			message: hasTranslation(
				"There's an ongoing site dispute. Contact us to review your site's standing and resolve the dispute."
			)
				? hasTranslation(
						"There's an ongoing site dispute. Contact us to review your site's standing and resolve the dispute."
				  )
				: translate( "Contact us to review your site's standing and resolve the dispute." ),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://en.support.wordpress.com/suspended-blogs/' ),
		},
		NO_SSL_CERTIFICATE: {
			message: hasTranslation(
				'Certificate installation in progress. Hold tight! We are setting up a digital certificate to allow secure browsing on your site using "HTTPS".'
			)
				? hasTranslation(
						'Certificate installation in progress. Hold tight! We are setting up a digital certificate to allow secure browsing on your site using "HTTPS".'
				  )
				: translate(
						'Hold tight! We are setting up a digital certificate to allow secure browsing on your site, using "HTTPS". Please try again in a few minutes.\''
				  ),
			status: null,
			contactUrl: null,
		},
	};
}

interface ExternalProps {
	context: string | null;
	holds: string[];
	isPlaceholder: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const HoldList = ( { context, holds, isPlaceholder, translate }: Props ) => {
	const holdMessages = getHoldMessages( context, translate );
	const blockingMessages = getBlockingMessages( translate );

	const blockingHold = holds.find( h => isHardBlockingHoldType( h, blockingMessages ) );

	return (
		<>
			{ ! isPlaceholder &&
				blockingHold &&
				isHardBlockingHoldType( blockingHold, blockingMessages ) && (
					<Notice
						status={ blockingMessages[ blockingHold ].status }
						text={ blockingMessages[ blockingHold ].message }
						showDismiss={ false }
					>
						{ blockingMessages[ blockingHold ].contactUrl && (
							<NoticeAction href={ blockingMessages[ blockingHold ].contactUrl } external>
								{ translate( 'Contact us' ) }
							</NoticeAction>
						) }
					</Notice>
				) }
			<div
				className={ classNames( {
					'eligibility-warnings__hold-list-dim': blockingHold,
				} ) }
				data-testid="HoldList-Card"
			>
				<CardHeading>
					<span className="eligibility-warnings__hold-heading">
						{ getCardHeading( context, translate ) }
					</span>
				</CardHeading>
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
								<div className="eligibility-warnings__message">
									<div className="eligibility-warnings__message-title">
										{ holdMessages[ hold ].title }
									</div>
									<div className="eligibility-warnings__message-description">
										{ holdMessages[ hold ].description }
									</div>
								</div>
								{ holdMessages[ hold ].supportUrl && (
									<div className="eligibility-warnings__hold-action">
										<Button
											compact
											disabled={ !! blockingHold }
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
			</div>
		</>
	);
};

function getCardHeading( context: string | null, translate: LocalizeProps[ 'translate' ] ) {
	const defaultCopy = translate( "To continue you'll need to:" );
	switch ( context ) {
		case 'plugins':
			return hasTranslation( "To install plugins you'll need to:" )
				? translate( "To install plugins you'll need to:" )
				: defaultCopy;
		case 'themes':
			return hasTranslation( "To install themes you'll need to:" )
				? translate( "To install plugins you'll need to:" )
				: defaultCopy;
		case 'hosting':
			return hasTranslation( "To activate hosting access you'll need to:" )
				? translate( "To activate hosting access you'll need to:" )
				: defaultCopy;
		default:
			return defaultCopy;
	}
}

function isKnownHoldType(
	hold: string,
	holdMessages: ReturnType< typeof getHoldMessages >
): hold is keyof ReturnType< typeof getHoldMessages > {
	return holdMessages.hasOwnProperty( hold );
}

/**
 * This checks if hold coming from API is blocking (@see getBlockingMessages);
 * For example, if we detect BLOCKED_ATOMIC_TRANSFER, we should block the path forward and direct the user
 * to our support.
 *
 * @param {string} hold Specific hold we want to check
 * @param {object} blockingMessages List of all holds we consider blocking
 * @returns {boolean} Is {hold} blocking or not
 */
function isHardBlockingHoldType(
	hold: string,
	blockingMessages: ReturnType< typeof getBlockingMessages >
): hold is keyof ReturnType< typeof getBlockingMessages > {
	return blockingMessages.hasOwnProperty( hold );
}

export const hasBlockingHold = ( holds: string[] ) =>
	holds.some( hold => isHardBlockingHoldType( hold, getBlockingMessages( identity ) ) );

export default localize( HoldList );
