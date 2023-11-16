import classnames from 'classnames';
import { createElement, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import {
	NOTICE_SITE_LAUNCH_SELLER_UPSELL,
	NOTICE_CELEBRATE_SITE_CREATION,
	NOTICE_CELEBRATE_SITE_LAUNCH,
	NOTICE_CELEBRATE_SITE_MIGRATION,
	NOTICE_CELEBRATE_SITE_COPY,
	NOTICE_CELEBRATE_SITE_SETUP_COMPLETE,
	NOTICE_STAGING_SITE,
	NOTICE_HOME_LIMITED_TIME_OFFER_COUPON,
	TASK_CONNECT_ACCOUNTS,
	TASK_EARN_FEATURES,
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
	TASK_MARKETPLACE,
	TASK_RENEW_EXPIRED_PLAN,
	TASK_RENEW_EXPIRING_PLAN,
	TASK_SITE_RESUME_COPY,
	TASK_SITE_SETUP_CHECKLIST,
	TASK_UPSELL_TITAN,
	TASK_VERIFY_EMAIL,
	TASK_WEBINARS,
	TASK_WP_COURSES,
	TASK_PROMOTE_POST,
	TASK_USE_BUILT_BY,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_RESTORE_BACKUP,
	TASK_FIVERR,
	TASK_DOMAIN_UPSELL,
	TASK_GOOGLE_DOMAIN_OWNERS,
	LAUNCHPAD_INTENT_BUILD,
	LAUNCHPAD_INTENT_HOSTING,
} from 'calypso/my-sites/customer-home/cards/constants';
import LaunchpadIntentBuild from 'calypso/my-sites/customer-home/cards/launchpad/intent-build';
import LaunchpadIntentHosting from 'calypso/my-sites/customer-home/cards/launchpad/intent-hosting';
import CelebrateSiteCopy from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-copy';
import CelebrateSiteCreation from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-setup-complete';
import SiteLaunchSellerUpsell from 'calypso/my-sites/customer-home/cards/notices/site-launch-seller-upsell';
import StagingSiteNotice from 'calypso/my-sites/customer-home/cards/notices/staging-site';
import ConnectAccounts from 'calypso/my-sites/customer-home/cards/tasks/connect-accounts';
import DomainUpsell from 'calypso/my-sites/customer-home/cards/tasks/domain-upsell';
import EarnFeatures from 'calypso/my-sites/customer-home/cards/tasks/earn-features';
import Fiverr from 'calypso/my-sites/customer-home/cards/tasks/fiverr';
import GoMobile from 'calypso/my-sites/customer-home/cards/tasks/go-mobile';
import GoogleDomainOwners from 'calypso/my-sites/customer-home/cards/tasks/google-domain-owners';
import Marketplace from 'calypso/my-sites/customer-home/cards/tasks/marketplace';
import NoticeHomeLimitedTimeOfferCoupon from 'calypso/my-sites/customer-home/cards/tasks/notice-home-limited-time-offer-coupon';
import PromotePost from 'calypso/my-sites/customer-home/cards/tasks/promote-post';
import Renew from 'calypso/my-sites/customer-home/cards/tasks/renew';
import { ReviveAutoRevertedAtomic } from 'calypso/my-sites/customer-home/cards/tasks/revive-auto-reverted-atomic';
import SiteResumeCopy from 'calypso/my-sites/customer-home/cards/tasks/site-resume-copy';
import SiteSetupList from 'calypso/my-sites/customer-home/cards/tasks/site-setup-list';
import TitanBanner from 'calypso/my-sites/customer-home/cards/tasks/titan-banner';
import UseBuiltBy from 'calypso/my-sites/customer-home/cards/tasks/use-built-by';
import VerifyEmail from 'calypso/my-sites/customer-home/cards/tasks/verify-email';
import Webinars from 'calypso/my-sites/customer-home/cards/tasks/webinars';
import WPCourses from 'calypso/my-sites/customer-home/cards/tasks/wp-courses';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

const cardComponents = {
	[ NOTICE_SITE_LAUNCH_SELLER_UPSELL ]: SiteLaunchSellerUpsell,
	[ NOTICE_CELEBRATE_SITE_CREATION ]: CelebrateSiteCreation,
	[ NOTICE_CELEBRATE_SITE_LAUNCH ]: CelebrateSiteLaunch,
	[ NOTICE_STAGING_SITE ]: StagingSiteNotice,
	[ NOTICE_CELEBRATE_SITE_MIGRATION ]: CelebrateSiteMigration,
	[ NOTICE_CELEBRATE_SITE_COPY ]: CelebrateSiteCopy,
	[ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE ]: CelebrateSiteSetupComplete,
	[ NOTICE_HOME_LIMITED_TIME_OFFER_COUPON ]: NoticeHomeLimitedTimeOfferCoupon,
	[ TASK_CONNECT_ACCOUNTS ]: ConnectAccounts,
	[ TASK_EARN_FEATURES ]: EarnFeatures,
	[ TASK_GO_MOBILE_ANDROID ]: GoMobile,
	[ TASK_GO_MOBILE_IOS ]: GoMobile,
	[ TASK_MARKETPLACE ]: Marketplace,
	[ TASK_PROMOTE_POST ]: PromotePost,
	[ TASK_RENEW_EXPIRED_PLAN ]: Renew,
	[ TASK_RENEW_EXPIRING_PLAN ]: Renew,
	[ TASK_REACTIVATE_EXPIRED_PLAN ]: ReviveAutoRevertedAtomic,
	[ TASK_REACTIVATE_ATOMIC_TRANSFER ]: ReviveAutoRevertedAtomic,
	[ TASK_REACTIVATE_RESTORE_BACKUP ]: ReviveAutoRevertedAtomic,
	[ TASK_SITE_RESUME_COPY ]: SiteResumeCopy,
	[ TASK_SITE_SETUP_CHECKLIST ]: SiteSetupList,
	[ LAUNCHPAD_INTENT_BUILD ]: LaunchpadIntentBuild,
	[ LAUNCHPAD_INTENT_HOSTING ]: LaunchpadIntentHosting,
	[ TASK_UPSELL_TITAN ]: TitanBanner,
	[ TASK_WEBINARS ]: Webinars,
	[ TASK_WP_COURSES ]: WPCourses,
	[ TASK_VERIFY_EMAIL ]: VerifyEmail,
	[ TASK_USE_BUILT_BY ]: UseBuiltBy,
	[ TASK_DOMAIN_UPSELL ]: DomainUpsell,
	[ TASK_GOOGLE_DOMAIN_OWNERS ]: GoogleDomainOwners,
	[ TASK_FIVERR ]: Fiverr,
};

const urgentTasks = [
	TASK_RENEW_EXPIRED_PLAN,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_RESTORE_BACKUP,
	TASK_SITE_RESUME_COPY,
];

const Primary = ( { cards, trackCard } ) => {
	const viewedCards = useRef( new Set() );

	const handlePageSelected = ( index ) => {
		const selectedCard = cards && cards[ index ];
		if ( viewedCards.current.has( selectedCard ) ) {
			return;
		}

		viewedCards.current.add( selectedCard );
		trackCard( selectedCard );
	};

	useEffect( () => handlePageSelected( 0 ) );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	let isUrgent = false;
	if ( cards.length === 1 ) {
		isUrgent = urgentTasks.includes( cards[ 0 ] );
	}

	return (
		<DotPager
			className={ classnames( 'primary__customer-home-location-content', {
				'primary__is-urgent': isUrgent,
			} ) }
			showControlLabels="true"
			hasDynamicHeight
			onPageSelected={ handlePageSelected }
		>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					! cardComponents[ card ].isDisabled &&
					createElement( cardComponents[ card ], {
						key: card + index,
						isIos: card === 'home-task-go-mobile-ios' ? true : null,
						card,
					} )
			) }
		</DotPager>
	);
};

const trackCardImpression = ( card ) => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
		bumpStat( 'calypso_customer_home_card_impression', card )
	);
};

export default withPerformanceTrackerStop(
	connect( null, { trackCard: trackCardImpression } )( Primary )
);
