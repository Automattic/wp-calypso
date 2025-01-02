import BloggingPrompt from 'calypso/components/blogging-prompt-card';
import {
	FEATURE_DOMAIN_UPSELL,
	FEATURE_READER,
	FEATURE_STATS,
	FEATURE_SUPPORT,
	LAUNCHPAD_ENTREPRENEUR_SITE_SETUP,
	LAUNCHPAD_INTENT_BUILD,
	LAUNCHPAD_INTENT_FREE_NEWSLETTER,
	LAUNCHPAD_INTENT_HOSTING,
	LAUNCHPAD_INTENT_PAID_NEWSLETTER,
	LAUNCHPAD_INTENT_WRITE,
	LAUNCHPAD_PRE_LAUNCH,
	LAUNCHPAD_LEGACY_SITE_SETUP,
	LAUNCHPAD_POST_MIGRATION,
	NOTICE_CELEBRATE_SITE_CREATION,
	NOTICE_CELEBRATE_SITE_LAUNCH,
	NOTICE_CELEBRATE_SITE_MIGRATION,
	NOTICE_CELEBRATE_SITE_COPY,
	NOTICE_CELEBRATE_SITE_SETUP_COMPLETE,
	NOTICE_HOME_LIMITED_TIME_OFFER_COUPON,
	NOTICE_READER_FIRST_POSTS,
	NOTICE_SITE_LAUNCH_SELLER_UPSELL,
	NOTICE_STAGING_SITE,
	SECTION_BLOGGING_PROMPT,
	SECTION_BLOGANUARY_BLOGGING_PROMPT,
	SECTION_LEARN_GROW,
	TASK_AFFILIATES,
	TASK_JANUARY_BUMP,
	TASK_CONNECT_ACCOUNTS,
	TASK_DOMAIN_UPSELL,
	TASK_EARN_FEATURES,
	TASK_FIVERR,
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
	TASK_GOOGLE_DOMAIN_OWNERS,
	TASK_MARKETPLACE,
	TASK_PROMOTE_POST,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_RESTORE_BACKUP,
	TASK_RENEW_EXPIRED_PLAN,
	TASK_RENEW_EXPIRING_PLAN,
	TASK_SITE_RESUME_COPY,
	TASK_SITE_SETUP_CHECKLIST,
	TASK_UPSELL_TITAN,
	TASK_USE_BUILT_BY,
	TASK_VERIFY_EMAIL,
	TASK_WEBINARS,
	TASK_WP_COURSES,
} from 'calypso/my-sites/customer-home/cards/constants';
import DomainUpsellFeature from 'calypso/my-sites/customer-home/cards/features/domain-upsell';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import ReaderCard from 'calypso/my-sites/customer-home/cards/features/reader';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import LaunchpadEntrepreneurSiteSetup from 'calypso/my-sites/customer-home/cards/launchpad/entrepreneur-site-setup';
import LaunchpadIntentBuild from 'calypso/my-sites/customer-home/cards/launchpad/intent-build';
import LaunchpadIntentHosting from 'calypso/my-sites/customer-home/cards/launchpad/intent-hosting';
import {
	LaunchpadIntentFreeNewsletter,
	LaunchpadIntentPaidNewsletter,
} from 'calypso/my-sites/customer-home/cards/launchpad/intent-newsletter';
import LaunchpadIntentWrite from 'calypso/my-sites/customer-home/cards/launchpad/intent-write';
import { LaunchpadPostMigration } from 'calypso/my-sites/customer-home/cards/launchpad/post-migration';
import LaunchpadPreLaunch from 'calypso/my-sites/customer-home/cards/launchpad/pre-launch';
import { LaunchpadSiteSetup } from 'calypso/my-sites/customer-home/cards/launchpad/site-setup';
import CelebrateSiteCopy from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-copy';
import CelebrateSiteCreation from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-setup-complete';
import ReaderFirstPosts from 'calypso/my-sites/customer-home/cards/notices/reader-first-posts';
import SiteLaunchSellerUpsell from 'calypso/my-sites/customer-home/cards/notices/site-launch-seller-upsell';
import StagingSiteNotice from 'calypso/my-sites/customer-home/cards/notices/staging-site';
import Affiliates from 'calypso/my-sites/customer-home/cards/tasks/affiliates';
import ConnectAccounts from 'calypso/my-sites/customer-home/cards/tasks/connect-accounts';
import DomainUpsell from 'calypso/my-sites/customer-home/cards/tasks/domain-upsell';
import EarnFeatures from 'calypso/my-sites/customer-home/cards/tasks/earn-features';
import Fiverr from 'calypso/my-sites/customer-home/cards/tasks/fiverr';
import GoMobile from 'calypso/my-sites/customer-home/cards/tasks/go-mobile';
import GoogleDomainOwners from 'calypso/my-sites/customer-home/cards/tasks/google-domain-owners';
import JanuaryBump from 'calypso/my-sites/customer-home/cards/tasks/january-bump';
import Marketplace from 'calypso/my-sites/customer-home/cards/tasks/marketplace';
import NoticeHomeLimitedTimeOfferCoupon from 'calypso/my-sites/customer-home/cards/tasks/notice-home-limited-time-offer-coupon';
import PromotePost from 'calypso/my-sites/customer-home/cards/tasks/promote-post';
import Renew from 'calypso/my-sites/customer-home/cards/tasks/renew';
import { ReviveAutoRevertedAtomic } from 'calypso/my-sites/customer-home/cards/tasks/revive-auto-reverted-atomic';
import SiteResumeCopy from 'calypso/my-sites/customer-home/cards/tasks/site-resume-copy';
import { ConnectedSiteSetupListWrapper } from 'calypso/my-sites/customer-home/cards/tasks/site-setup-list';
import TitanBanner from 'calypso/my-sites/customer-home/cards/tasks/titan-banner';
import UseBuiltBy from 'calypso/my-sites/customer-home/cards/tasks/use-built-by';
import VerifyEmail from 'calypso/my-sites/customer-home/cards/tasks/verify-email';
import Webinars from 'calypso/my-sites/customer-home/cards/tasks/webinars';
import WPCourses from 'calypso/my-sites/customer-home/cards/tasks/wp-courses';
import LearnGrow from 'calypso/my-sites/customer-home/locations/secondary/learn-grow';
import type { ReactNode } from 'react';

type CardComponentMap = Record<
	string,
	( ( props: any ) => React.JSX.Element | ReactNode ) | typeof ReaderCard
>;

const PRIMARY_CARD_COMPONENTS: CardComponentMap = {
	[ LAUNCHPAD_INTENT_BUILD ]: LaunchpadIntentBuild,
	[ LAUNCHPAD_INTENT_HOSTING ]: LaunchpadIntentHosting,
	[ NOTICE_CELEBRATE_SITE_COPY ]: CelebrateSiteCopy,
	[ NOTICE_CELEBRATE_SITE_CREATION ]: CelebrateSiteCreation,
	[ NOTICE_CELEBRATE_SITE_LAUNCH ]: CelebrateSiteLaunch,
	[ NOTICE_CELEBRATE_SITE_MIGRATION ]: CelebrateSiteMigration,
	[ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE ]: CelebrateSiteSetupComplete,
	[ NOTICE_HOME_LIMITED_TIME_OFFER_COUPON ]: NoticeHomeLimitedTimeOfferCoupon,
	[ NOTICE_SITE_LAUNCH_SELLER_UPSELL ]: SiteLaunchSellerUpsell,
	[ NOTICE_STAGING_SITE ]: StagingSiteNotice,
	[ TASK_AFFILIATES ]: Affiliates,
	[ TASK_JANUARY_BUMP ]: JanuaryBump,
	[ TASK_CONNECT_ACCOUNTS ]: ConnectAccounts,
	[ TASK_DOMAIN_UPSELL ]: DomainUpsell,
	[ TASK_EARN_FEATURES ]: EarnFeatures,
	[ TASK_FIVERR ]: Fiverr,
	[ TASK_GO_MOBILE_ANDROID ]: GoMobile,
	[ TASK_GO_MOBILE_IOS ]: GoMobile,
	[ TASK_GOOGLE_DOMAIN_OWNERS ]: GoogleDomainOwners,
	[ TASK_MARKETPLACE ]: Marketplace,
	[ TASK_PROMOTE_POST ]: PromotePost,
	[ TASK_RENEW_EXPIRED_PLAN ]: Renew,
	[ TASK_RENEW_EXPIRING_PLAN ]: Renew,
	[ TASK_REACTIVATE_ATOMIC_TRANSFER ]: ReviveAutoRevertedAtomic,
	[ TASK_REACTIVATE_EXPIRED_PLAN ]: ReviveAutoRevertedAtomic,
	[ TASK_REACTIVATE_RESTORE_BACKUP ]: ReviveAutoRevertedAtomic,
	[ TASK_SITE_RESUME_COPY ]: SiteResumeCopy,
	[ TASK_SITE_SETUP_CHECKLIST ]: ConnectedSiteSetupListWrapper,
	[ TASK_UPSELL_TITAN ]: TitanBanner,
	[ TASK_USE_BUILT_BY ]: UseBuiltBy,
	[ TASK_VERIFY_EMAIL ]: VerifyEmail,
	[ TASK_WEBINARS ]: Webinars,
	[ TASK_WP_COURSES ]: WPCourses,
};

const CARD_COMPONENTS: CardComponentMap = {
	...PRIMARY_CARD_COMPONENTS,
	[ FEATURE_DOMAIN_UPSELL ]: DomainUpsellFeature,
	[ FEATURE_READER ]: ReaderCard,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ FEATURE_STATS ]: Stats,
	[ LAUNCHPAD_ENTREPRENEUR_SITE_SETUP ]: LaunchpadEntrepreneurSiteSetup,
	[ LAUNCHPAD_INTENT_BUILD ]: LaunchpadIntentBuild,
	[ LAUNCHPAD_INTENT_FREE_NEWSLETTER ]: LaunchpadIntentFreeNewsletter,
	[ LAUNCHPAD_INTENT_HOSTING ]: LaunchpadIntentHosting,
	[ LAUNCHPAD_INTENT_PAID_NEWSLETTER ]: LaunchpadIntentPaidNewsletter,
	[ LAUNCHPAD_INTENT_WRITE ]: LaunchpadIntentWrite,
	[ LAUNCHPAD_PRE_LAUNCH ]: LaunchpadPreLaunch,
	[ LAUNCHPAD_LEGACY_SITE_SETUP ]: LaunchpadSiteSetup,
	[ LAUNCHPAD_POST_MIGRATION ]: LaunchpadPostMigration,
	[ NOTICE_READER_FIRST_POSTS ]: ReaderFirstPosts,
	[ SECTION_BLOGGING_PROMPT ]: BloggingPrompt,
	[ SECTION_BLOGANUARY_BLOGGING_PROMPT ]: BloggingPrompt,
	[ SECTION_LEARN_GROW ]: LearnGrow,
};

const urgentTasks = [
	TASK_RENEW_EXPIRED_PLAN,
	TASK_REACTIVATE_EXPIRED_PLAN,
	TASK_REACTIVATE_ATOMIC_TRANSFER,
	TASK_REACTIVATE_RESTORE_BACKUP,
	TASK_SITE_RESUME_COPY,
];

const isUrgentCard = ( cardId: string ) => urgentTasks.includes( cardId );

export { PRIMARY_CARD_COMPONENTS, CARD_COMPONENTS, isUrgentCard };
