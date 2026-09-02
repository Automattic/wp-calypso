import { isEnabled } from '@automattic/calypso-config';
import { PLAN_BUSINESS, PLAN_PERSONAL, getPlan } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { localize, LocalizeProps } from 'i18n-calypso';
import ExcessiveDiskSpace from 'calypso/blocks/eligibility-warnings/excessive-disk-space';
import CardHeading from 'calypso/components/card-heading';
import Notice, { NoticeStatus } from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { useSelector } from 'calypso/state';
import { eligibilityHolds, type EligibilityHold } from 'calypso/state/automated-transfer/constants';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { isAtomicSiteWithoutBusinessPlan } from './utils';

// Mapping eligibility holds to messages that will be shown to the user
function getHoldMessages( {
	context,
	translate,
	billingPeriod,
	isMarketplace,
	hasEnTranslation,
}: {
	context: string | null;
	translate: LocalizeProps[ 'translate' ];
	billingPeriod?: string;
	isMarketplace?: boolean;
	hasEnTranslation: ( arg: string ) => boolean;
} ) {
	// Plugin upload is available on the Personal plan and up, so upsell the
	// lowest eligible plan for that context instead of Business.
	const upsellPersonalPlan =
		context === 'plugins-upload' ||
		( isMarketplace && isEnabled( 'marketplace-personal-premium' ) );

	return {
		NO_BUSINESS_PLAN: {
			title: ( function () {
				if ( upsellPersonalPlan ) {
					return translate( 'Upgrade to a %(personalPlanName)s plan', {
						args: { personalPlanName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
					} );
				}

				return translate( 'Upgrade to a %(businessPlanName)s plan', {
					args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
				} );
			} )(),
			description: ( function () {
				if ( context === 'themes' ) {
					return hasEnTranslation(
						"You'll also get to install custom plugins, have more storage, and access priority 24/7 support."
					)
						? translate(
								"You'll also get to install custom plugins, have more storage, and access priority 24/7 support."
						  )
						: translate(
								"You'll also get to install custom plugins, have more storage, and access live support."
						  );
				}

				if ( upsellPersonalPlan ) {
					return hasEnTranslation(
						"You'll also get a free domain for one year, and access fast support."
					)
						? translate( "You'll also get a free domain for one year, and access fast support." )
						: translate( "You'll also get a free domain for one year, and access email support." );
				}

				if ( billingPeriod === IntervalLength.MONTHLY ) {
					return hasEnTranslation(
						"You'll also get to install custom themes, have more storage, and access fast support."
					)
						? translate(
								"You'll also get to install custom themes, have more storage, and access fast support."
						  )
						: translate(
								"You'll also get to install custom themes, have more storage, and access email support."
						  );
				}

				return hasEnTranslation(
					"You'll also get to install custom themes, have more storage, and access priority 24/7 support."
				)
					? translate(
							"You'll also get to install custom themes, have more storage, and access priority 24/7 support."
					  )
					: translate(
							"You'll also get to install custom themes, have more storage, and access live support."
					  );
			} )(),
			supportUrl: null,
		},
		SITE_PRIVATE: {
			title: translate( 'Public site needed' ),
			description: translate(
				'Change your site\'s Privacy settings to "Public" or "Hidden" (not "Private.")'
			),
			supportUrl: localizeUrl( 'https://wordpress.com/support/settings/privacy-settings/' ),
		},
		SITE_UNLAUNCHED: {
			title: translate( 'Launch your site' ),
			description: translate(
				'Only you and those you invite can view your site. Launch your site to make it visible to the public.'
			),
			supportUrl: null,
		},
		SITE_NOT_PUBLIC: {
			title: translate( 'Make your site public' ),
			description: translate( 'Only you and those you invite can view your site.' ),
			supportUrl: null,
		},
		NON_ADMIN_USER: {
			title: translate( 'Site administrator only' ),
			description: translate( 'Only the site administrators can use this feature.' ),
			supportUrl: localizeUrl( 'https://wordpress.com/support/user-roles/' ),
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Domain pointing to a different site' ),
			description: translate(
				"Your domain is not properly set up to point to your site. Reset your domain's A records in the Domains section to fix this."
			),
			supportUrl: localizeUrl(
				'https://wordpress.com/support/move-domain/setting-custom-a-records/'
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
			title: translate( 'Increase storage space', {
				comment:
					'Message displayed when a Simple site cannot be transferred to Atomic because there is not enough disk space. It appears after the heading "To continue you\'ll need to: ", inside a list with actions to perform in order to proceed with the transfer.',
			} ),
			description: <ExcessiveDiskSpace />,
			supportUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
		IS_STAGING_SITE: {
			title: translate( 'Create a new staging site' ),
			description: translate(
				'Hosting features cannot be activated for a staging site. Create a new staging site to continue.'
			),
			supportUrl: null,
		},
	};
}

const hardBlockingHolds = [
	eligibilityHolds.BLOCKED_ATOMIC_TRANSFER,
	eligibilityHolds.TRANSFER_ALREADY_EXISTS,
	eligibilityHolds.NO_JETPACK_SITES,
	eligibilityHolds.NO_VIP_SITES,
	eligibilityHolds.SITE_GRAYLISTED,
	eligibilityHolds.NO_SSL_CERTIFICATE,
] as const;

export type HardBlockingHold = Extract< EligibilityHold, ( typeof hardBlockingHolds )[ number ] >;

type BlockingMessage = {
	message: string;
	status: NoticeStatus | null;
	contactUrl: string | null;
};

type BlockingMessages = Record< HardBlockingHold, BlockingMessage >;

export function getBlockingMessages(
	translate: LocalizeProps[ 'translate' ] | ( ( str: string ) => string )
): BlockingMessages {
	return {
		BLOCKED_ATOMIC_TRANSFER: {
			message: String(
				translate(
					'This site is not currently eligible to install themes and plugins, or activate hosting access. Please contact our support team for help.'
				)
			),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
		TRANSFER_ALREADY_EXISTS: {
			message: String(
				translate(
					'Installation in progress. Just a minute! Please wait until the installation is finished, then try again.'
				)
			),
			status: null,
			contactUrl: null,
		},
		NO_JETPACK_SITES: {
			message: String( translate( 'Try using a different site.' ) ),
			status: 'is-error',
			contactUrl: null,
		},
		NO_VIP_SITES: {
			message: String( translate( 'Try using a different site.' ) ),
			status: 'is-error',
			contactUrl: null,
		},
		SITE_GRAYLISTED: {
			message: String(
				translate(
					"There's an ongoing site dispute. Contact us to review your site's standing and resolve the dispute."
				)
			),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://wordpress.com/support/suspended-blogs/' ),
		},
		NO_SSL_CERTIFICATE: {
			message: String(
				translate(
					'Certificate installation in progress. Hold tight! We are setting up a digital certificate to allow secure browsing on your site using "HTTPS".'
				)
			),
			status: null,
			contactUrl: null,
		},
	};
}

interface ExternalProps {
	context: string | null;
	holds: string[];
	isMarketplace?: boolean;
	isPlaceholder: boolean;
}

type Props = ExternalProps & LocalizeProps;

/*
	For Atomic sites on plans below Business the API returns the holds TRANSFER_ALREADY_EXISTS and NO_BUSINESS_PLAN.
	Because TRANSFER_ALREADY_EXISTS is present and 'blocking' it would show an "Upload in progress" notice even when there isn't one.
	In this scenario we treat the blocking hold as invalid so the caller renders the upgrade prompt instead.
*/
export function getValidBlockingHold( holds: string[] ): HardBlockingHold | undefined {
	if ( isAtomicSiteWithoutBusinessPlan( holds ) ) {
		return undefined;
	}

	return holds.find( isHardBlockingHoldType );
}

export const HardBlockingNotice = ( {
	blockingHold,
	translate,
	blockingMessages,
}: {
	blockingHold: HardBlockingHold;
	translate: LocalizeProps[ 'translate' ];
	blockingMessages: BlockingMessages;
} ) => {
	return (
		<Notice
			status={ blockingMessages[ blockingHold ].status ?? 'is-info' }
			text={ blockingMessages[ blockingHold ].message }
			showDismiss={ false }
		>
			{ blockingMessages[ blockingHold ].contactUrl && (
				<NoticeAction href={ blockingMessages[ blockingHold ].contactUrl } external>
					{ translate( 'Contact us' ) }
				</NoticeAction>
			) }
		</Notice>
	);
};

export const HoldList = ( { context, holds, isMarketplace, isPlaceholder, translate }: Props ) => {
	const hasEnTranslation = useHasEnTranslation();

	const billingPeriod = useSelector( getBillingInterval );
	const holdMessages = getHoldMessages( {
		context,
		translate,
		billingPeriod,
		isMarketplace,
		hasEnTranslation,
	} );

	return (
		<div className="eligibility-warnings__hold-list" data-testid="HoldList-Card">
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
				holds.map( ( hold ) =>
					! isKnownHoldType( hold, holdMessages ) ? null : (
						<div className="eligibility-warnings__hold" key={ hold }>
							<div className="eligibility-warnings__message">
								<div className="eligibility-warnings__message-title">
									{ holdMessages[ hold ].title }
								</div>
								<p className="eligibility-warnings__message-description">
									{ holdMessages[ hold ].description }
								</p>
							</div>
							{ holdMessages[ hold ].supportUrl && (
								<div className="eligibility-warnings__hold-action">
									<Button
										compact
										href={ holdMessages[ hold ].supportUrl ?? '' }
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
	);
};

function getCardHeading( context: string | null, translate: LocalizeProps[ 'translate' ] ) {
	switch ( context ) {
		case 'plugins':
			return translate( "To install plugins you'll need to:" );
		case 'themes':
			return translate( "To install themes you'll need to:" );
		case 'hosting':
			return translate( "To activate hosting access you'll need to:" );
		case 'performance':
			return translate( "To activate Performance Features you'll need to:" );
		default:
			return translate( "To continue you'll need to:" );
	}
}

function isKnownHoldType(
	hold: string,
	holdMessages: ReturnType< typeof getHoldMessages >
): hold is keyof ReturnType< typeof getHoldMessages > {
	return holdMessages.hasOwnProperty( hold );
}

function isHardBlockingHoldType( hold: string ): hold is HardBlockingHold {
	return hardBlockingHolds.some( ( blockingHold ) => blockingHold === hold );
}

export const hasBlockingHold = ( holds: string[] ) => holds.some( isHardBlockingHoldType );

export default localize( HoldList );
