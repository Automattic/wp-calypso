/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

/**
 * Illustrations
 */
import adwordsGoogle from 'assets/images/illustrations/adwords-google.svg';
import appBannerEditor from 'assets/images/illustrations/app-banner-editor.svg';
import appBannerNotifications from 'assets/images/illustrations/app-banner-notifications.svg';
import appBannerReader from 'assets/images/illustrations/app-banner-reader.svg';
import appBannerStats from 'assets/images/illustrations/app-banner-stats.svg';
import apps from 'assets/images/illustrations/apps.svg';
import blockEditorFade from 'assets/images/illustrations/block-editor-fade.svg';
import builderReferral from 'assets/images/illustrations/builder-referral.svg';
import checkEmail from 'assets/images/illustrations/check-email.svg';
import customDomain from 'assets/images/illustrations/custom-domain.svg';
import customDomainBlogger from 'assets/images/illustrations/custom-domain-blogger.svg';
import dashboard from 'assets/images/illustrations/dashboard.svg';
import dotcomSupport from 'assets/images/illustrations/dotcom-support.svg';
import dotcomWordAds from 'assets/images/illustrations/dotcom-wordads.svg';
import fireworks from 'assets/images/illustrations/fireworks.svg';
import getAppsBanner from 'assets/images/illustrations/get-apps-banner.svg';
import googleAnalytics from 'assets/images/illustrations/google-analytics.svg';
import googleMyBusinessFeature from 'assets/images/illustrations/google-my-business-feature.svg';
import jetpackBackup from 'assets/images/illustrations/jetpack-backup.svg';
import jetpackConcierge from 'assets/images/illustrations/jetpack-concierge.svg';
import jetpackScan from 'assets/images/illustrations/jetpack-scan.svg';
import jetpackSearch from 'assets/images/illustrations/jetpack-search.svg';
import logoJpc from 'assets/images/illustrations/logo-jpc.svg';
import marketing from 'assets/images/illustrations/marketing.svg';
import media from 'assets/images/illustrations/media.svg';
import migratingHostDiy from 'assets/images/illustrations/migrating-host-diy.svg';
import noMemberships from 'assets/images/illustrations/no-memberships.svg';
import payments from 'assets/images/illustrations/payments.svg';
import privacy from 'assets/images/illustrations/private.svg';
import removedAds from 'assets/images/illustrations/removed-ads.svg';
import seoPageTitle from 'assets/images/illustrations/seo-page-title.svg';
import siteActivity from 'assets/images/illustrations/site-activity.svg';
import themes from 'assets/images/illustrations/themes.svg';
import updates from 'assets/images/illustrations/updates.svg';
import videoHosting from 'assets/images/illustrations/video-hosting.svg';
import whoops from 'assets/images/illustrations/whoops.svg';

export default class Illustrations extends React.PureComponent {
	render() {
		return (
			<Main className="devdocs design__illustrations devdocs__illustrations">
				<DocumentHead title="Illustrations" />

				<div className="design__illustrations-content devdocs__doc-content">
					<h1>Illustrations</h1>
					<img src={ adwordsGoogle } alt="" />
					<img src={ appBannerEditor } alt="" />
					<img src={ appBannerNotifications } alt="" />
					<img src={ appBannerReader } alt="" />
					<img src={ appBannerStats } alt="" />
					<img src={ apps } alt="" />
					<img src={ blockEditorFade } alt="" />
					<img src={ builderReferral } alt="" />
					<img src={ checkEmail } alt="" />
					<img src={ customDomain } alt="" />
					<img src={ customDomainBlogger } alt="" />
					<img src={ dashboard } alt="" />
					<img src={ dotcomSupport } alt="" />
					<img src={ dotcomWordAds } alt="" />
					<img src={ fireworks } alt="" />
					<img src={ getAppsBanner } alt="" />
					<img src={ googleAnalytics } alt="" />
					<img src={ googleMyBusinessFeature } alt="" />
					<img src={ jetpackBackup } alt="" />
					<img src={ jetpackConcierge } alt="" />
					<img src={ jetpackScan } alt="" />
					<img src={ jetpackSearch } alt="" />
					<img src={ logoJpc } alt="" />
					<img src={ marketing } alt="" />
					<img src={ media } alt="" />
					<img src={ migratingHostDiy } alt="" />
					<img src={ noMemberships } alt="" />
					<img src={ payments } alt="" />
					<img src={ privacy } alt="" />
					<img src={ removedAds } alt="" />
					<img src={ seoPageTitle } alt="" />
					<img src={ siteActivity } alt="" />
					<img src={ themes } alt="" />
					<img src={ updates } alt="" />
					<img src={ videoHosting } alt="" />
					<img src={ whoops } alt="" />
				</div>
			</Main>
		);
	}
}
