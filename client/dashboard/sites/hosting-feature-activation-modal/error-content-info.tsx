import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Fragment } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import type { NoticeVariant } from '../../components/notice/types';
import type { AutomatedTransferEligibilityError } from '@automattic/api-core';

export const EligibilityErrors = {
	BLOCKED_ATOMIC_TRANSFER: 'blocked_atomic_transfer',
	TRANSFER_ALREADY_EXISTS: 'transfer_already_exists',
	NO_BUSINESS_PLAN: 'no_business_plan',
	NO_JETPACK_SITES: 'no_jetpack_sites',
	NO_VIP_SITES: 'no_vip_sites',
	SITE_GRAYLISTED: 'site_graylisted',
	NON_ADMIN_USER: 'non_admin_user',
	NOT_RESOLVING_TO_WPCOM: 'not_resolving_to_wpcom',
	NO_SSL_CERTIFICATE: 'no_ssl_certificate',
	EMAIL_UNVERIFIED: 'email_unverified',
	EXCESSIVE_DISK_SPACE: 'excessive_disk_space',
	IS_STAGING_SITE: 'is_staging_site',
} as const;

type EligibilityErrors = ( typeof EligibilityErrors )[ keyof typeof EligibilityErrors ];

type BlockingMessage = {
	code: string;
	message: string;
	variant: NoticeVariant;
	supportUrl?: string;
};

const BlockingMessages: Partial< Record< EligibilityErrors, BlockingMessage > > = {
	[ EligibilityErrors.BLOCKED_ATOMIC_TRANSFER ]: {
		code: EligibilityErrors.BLOCKED_ATOMIC_TRANSFER,
		message: __(
			'This site is not currently eligible to install themes and plugins, or activate hosting access. Please contact our support team for help.'
		),
		variant: 'error',
	},
	[ EligibilityErrors.TRANSFER_ALREADY_EXISTS ]: {
		code: EligibilityErrors.TRANSFER_ALREADY_EXISTS,
		message: __(
			'Installation in progress. Just a minute! Please wait until the installation is finished, then try again.'
		),
		variant: 'info',
	},
	[ EligibilityErrors.NO_JETPACK_SITES ]: {
		code: EligibilityErrors.NO_JETPACK_SITES,
		message: __( 'Try using a different site.' ),
		variant: 'error',
	},
	[ EligibilityErrors.NO_VIP_SITES ]: {
		code: EligibilityErrors.NO_VIP_SITES,
		message: __( 'Try using a different site.' ),
		variant: 'error',
	},
	[ EligibilityErrors.SITE_GRAYLISTED ]: {
		code: EligibilityErrors.SITE_GRAYLISTED,
		message: __(
			'There’s an ongoing site dispute. Contact us to review your site’s standing and resolve the dispute.'
		),
		variant: 'error',
		// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
		supportUrl: 'https://wordpress.com/support/suspended-blogs/',
	},
	[ EligibilityErrors.NO_SSL_CERTIFICATE ]: {
		code: EligibilityErrors.NO_SSL_CERTIFICATE,
		message: __(
			'Certificate installation in progress. Hold tight! We are setting up a digital certificate to allow secure browsing on your site using "HTTPS".'
		),
		variant: 'info',
	},
};

type HoldingMessage = {
	code: string;
	title: string;
	description: string;
	supportUrl?: string;
};

const HoldingMessages: Partial< Record< EligibilityErrors, HoldingMessage > > = {
	[ EligibilityErrors.NO_BUSINESS_PLAN ]: {
		code: EligibilityErrors.NO_BUSINESS_PLAN,
		title: sprintf(
			// translators: %(planName)s is the name of the plan
			__( '%(planName)s plan required' ),
			{
				planName: getPlanNames()[ DotcomPlans.BUSINESS ],
			}
		),
		description: __( 'You’ll also get to install custom themes, plugins, and have more storage.' ),
	},
	[ EligibilityErrors.NON_ADMIN_USER ]: {
		code: EligibilityErrors.NON_ADMIN_USER,
		title: __( 'Site administrator only' ),
		description: __( 'Only the site administrators can use this feature.' ),
		// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
		supportUrl: 'https://wordpress.com/support/user-roles/',
	},
	[ EligibilityErrors.NOT_RESOLVING_TO_WPCOM ]: {
		code: EligibilityErrors.NOT_RESOLVING_TO_WPCOM,
		title: __( 'Domain pointing to a different site' ),
		description: __(
			'Your domain is not properly set up to point to your site. Reset your domain’s A records in the Domains section to fix this.'
		),
		// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
		supportUrl: 'https://wordpress.com/support/move-domain/setting-custom-a-records/',
	},
	[ EligibilityErrors.EMAIL_UNVERIFIED ]: {
		code: EligibilityErrors.EMAIL_UNVERIFIED,
		title: __( 'Confirm your email address' ),
		description: __(
			'Check your email for a message we sent you when you signed up. Click the link inside to confirm your email address. You may have to check your email client’s spam folder.'
		),
	},
	[ EligibilityErrors.EXCESSIVE_DISK_SPACE ]: {
		code: EligibilityErrors.EXCESSIVE_DISK_SPACE,
		// TODO: Implement upsells
		title: __( 'Increase storage space' ),
		description: __(
			'Your site does not have enough available storage space. Please purchase a plan with additional storage or contact our support team for help.'
		),
	},
	[ EligibilityErrors.IS_STAGING_SITE ]: {
		code: EligibilityErrors.IS_STAGING_SITE,
		title: __( 'Create a new staging site' ),
		description: __(
			'Hosting features cannot be activated for a staging site. Create a new staging site to continue.'
		),
	},
};

/*
	For Atomic sites on plans below Business it will return the holds TRANSFER_ALREADY_EXISTS and NO_BUSINESS_PLAN.
	Because TRANSFER_ALREADY_EXISTS is present and 'blocking' it will show an "Upload in progress" notice even when there isn't one.
	In this scenario we need to check if it's an Atomic ste (TRANSFER_ALREADY_EXISTS) on a plan below Business (NO_BUSINESS_PLAN)
	so we can stop the render of "Upload in progress" and prompt them to upgrade instead.
*/
function isAtomicSiteWithoutBusinessPlan( errors: AutomatedTransferEligibilityError[] ) {
	return [ EligibilityErrors.TRANSFER_ALREADY_EXISTS, EligibilityErrors.NO_BUSINESS_PLAN ].every(
		( code ) => errors.some( ( error ) => error.code === code )
	);
}

function findFirstBlockingError( errors: AutomatedTransferEligibilityError[] ) {
	const error = errors.find( ( err ) => err.code in BlockingMessages );
	if ( ! error ) {
		return null;
	}

	return BlockingMessages[ error.code as EligibilityErrors ];
}

function findHoldingErrors( errors: AutomatedTransferEligibilityError[] ) {
	return errors.reduce( ( acc, err ) => {
		const holdingMessage = HoldingMessages[ err.code as EligibilityErrors ];
		if ( holdingMessage ) {
			acc.push( holdingMessage );
		}

		return acc;
	}, [] as HoldingMessage[] );
}

export function hasAnyBlockingError( errors: AutomatedTransferEligibilityError[] ) {
	return findFirstBlockingError( errors ) !== null;
}

export function hasHoldingError(
	errors: AutomatedTransferEligibilityError[],
	code: EligibilityErrors
) {
	return errors.some( ( error ) => error.code === code );
}

export function ErrorContentInfo( { errors }: { errors: AutomatedTransferEligibilityError[] } ) {
	const blocking = ! isAtomicSiteWithoutBusinessPlan( errors ) && findFirstBlockingError( errors );
	const holds = findHoldingErrors( errors );

	return (
		<VStack>
			{ blocking && (
				<>
					<ComponentViewTracker
						eventName="calypso_dashboard_hosting_feature_activation_modal_blocking_error_impression"
						properties={ { code: blocking.code } }
					/>
					<Notice variant={ blocking.variant }>
						{ blocking.message }
						{ blocking.supportUrl && (
							<>
								{ ' ' }
								<ExternalLink href={ blocking.supportUrl }>{ __( 'Learn more' ) }</ExternalLink>
							</>
						) }
					</Notice>
				</>
			) }
			{ holds.length > 0 && (
				<Card size="small">
					<CardHeader>
						<Text as="h2" weight={ 500 }>
							{ __( 'To activate hosting access you’ll need to:' ) }
						</Text>
					</CardHeader>
					{ holds.map( ( hold, index ) => (
						<Fragment key={ index }>
							<ComponentViewTracker
								eventName="calypso_dashboard_hosting_feature_activation_modal_holding_error_impression"
								properties={ { code: hold.code } }
							/>
							<CardBody>
								<VStack>
									<Text as="h3" weight={ 500 }>
										{ hold.title }
									</Text>
									<Text as="p">
										{ hold.description }
										{ hold.supportUrl && (
											<>
												{ ' ' }
												<ExternalLink href={ hold.supportUrl }>{ __( 'Learn more' ) }</ExternalLink>
											</>
										) }
									</Text>
								</VStack>
							</CardBody>
							{ index < holds.length - 1 && <CardDivider /> }
						</Fragment>
					) ) }
				</Card>
			) }
		</VStack>
	);
}
