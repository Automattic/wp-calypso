import { Gridicon, ExternalLink } from '@automattic/components';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback } from 'react';
import DoNotSellDialogContainer from 'calypso/blocks/do-not-sell-dialog';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SocialLogo from 'calypso/components/social-logo';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDoNotSell } from 'calypso/lib/analytics/utils';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/url';
import appStoreBadge from './assets/app-store-badge.png';
import googlePlayBadge from './assets/google-play-badge.png';
import a8cLogo from './assets/logo-a8c-white.svg';
import LocalSwitcher from './locale-switcher';

import './style.scss';

const JPCOM_HOME = 'https://jetpack.com';
const A8C_HOME = 'https://automattic.com/';
const A8C_WORK = 'https://automattic.com/work-with-us/';
const GOOGLE_PLAY_JETPACK_URL = 'https://play.google.com/store/apps/details?id=com.jetpack.android';
const APP_STORE_JETPACK_URL = 'https://apps.apple.com/us/app/jetpack-website-builder/id1565481562';

const utmParams = {
	utm_medium: 'automattic_referred',
	utm_source: 'jpcom_footer',
};
const getTrackLinkClick = ( link: string | undefined ) => () => {
	if ( ! link ) {
		return;
	}
	recordTracksEvent( 'calypso_jetpack_footer_link_click', { link } );
};

/**
 * WARNING: this component is a reflection of the Jetpack.com footer, whose markup is located here:
 * https://opengrok.a8c.com/source/xref/a8c/jetpackme-new/parts/shared/footer.php
 *
 * Both footers should stay in sync as much as possible.
 */
const JetpackComFooter: React.FC = () => {
	const translate = useTranslate();
	const region = useGeoLocationQuery()?.data?.region;
	const hideCaliforniaNotice = useMemo(
		() => region && region.toLowerCase() !== 'california',
		[ region ]
	);
	const { shouldSeeDoNotSell, isDoNotSell, onSetDoNotSell } = useDoNotSell();
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	const openDialog = useCallback( () => {
		setIsDialogOpen( true );
	}, [] );
	const closeDialog = useCallback( () => {
		setIsDialogOpen( false );
	}, [] );

	const defaultLocale = useLocale();
	const [ isLocaleSwitcherVisible, setLocaleSwitcherVisibility ] = useState( false );
	const { sitemap, socialProps } = useMemo( () => {
		const sitemap = [
			{
				category: translate( 'WordPress Plugins' ),
				items: [
					{
						label: translate( 'Akismet Anti-spam' ),
						href: 'https://wordpress.org/plugins/akismet/',
						trackId: 'jetpack_antispam',
					},
					{
						label: translate( 'Jetpack' ),
						href: 'https://wordpress.org/plugins/jetpack/',
						trackId: 'jetpack',
					},
					{
						label: translate( 'Jetpack Boost' ),
						href: 'https://wordpress.org/plugins/jetpack-boost/',
						trackId: 'jetpack_boost',
					},
					{
						label: translate( 'Jetpack CRM' ),
						href: 'https://wordpress.org/plugins/zero-bs-crm/',
						trackId: 'jetpack_crm',
					},
					{
						label: translate( 'Jetpack Protect' ),
						href: 'https://wordpress.org/plugins/jetpack-protect/',
						trackId: 'jetpack_protect',
					},
					{
						label: translate( 'Jetpack Search' ),
						href: 'https://wordpress.org/plugins/jetpack-search/',
						trackId: 'jetpack_search',
					},
					{
						label: translate( 'Jetpack Social' ),
						href: 'https://wordpress.org/plugins/jetpack-social/',
						trackId: 'jetpack_social',
					},
					{
						label: translate( 'Jetpack VideoPress' ),
						href: 'https://wordpress.org/plugins/jetpack-videopress/',
						trackId: 'jetpack_videopress',
					},
					{
						label: translate( 'VaultPress Backup' ),
						href: 'https://wordpress.org/plugins/jetpack-backup/',
						trackId: 'jetpack_backup',
					},
					{
						label: translate( 'WP Super Cache' ),
						href: 'https://wordpress.org/plugins/wp-super-cache/',
						trackId: 'wp_supercache',
					},
				],
			},
			{
				category: translate( 'Partners' ),
				items: [
					{
						label: translate( 'Recommended Hosts' ),
						href: 'https://jetpack.com/hosting/',
						trackId: 'hosting_guide',
					},
					{
						label: translate( 'For Hosts' ),
						href: 'https://jetpack.com/for/hosts/',
						trackId: 'become_a_partner',
					},
					{
						label: translate( 'For Agencies' ),
						href: 'https://jetpack.com/for/agencies/',
						trackId: 'become_an_agency',
					},
					{
						label: translate( 'For Affiliates' ),
						href: 'https://jetpack.com/affiliates/',
						trackId: 'become_an_affiliate',
					},
				],
			},
			{
				category: translate( 'Developers' ),
				items: [
					{
						label: translate( 'Documentation' ),
						href: addQueryArgs( utmParams, 'https://developer.jetpack.com/' ),
						trackId: 'developers_site',
					},
					{
						label: translate( 'Beta Program' ),
						href: 'https://jetpack.com/beta/',
						trackId: 'beta_program',
					},
					{
						label: translate( 'Contribute to Jetpack' ),
						href: 'https://jetpack.com/contribute/',
						trackId: 'contribute_to_jetpack',
					},
				],
			},
			{
				category: translate( 'Legal' ),
				items: [
					{
						label: translate( 'Terms of Service' ),
						href: addQueryArgs( utmParams, localizeUrl( 'https://wordpress.com/tos/' ) ),
						trackId: 'terms_of_service',
					},
					{
						label: translate( 'Privacy Policy' ),
						href: addQueryArgs( utmParams, localizeUrl( 'https://automattic.com/privacy/' ) ),
						trackId: 'privacy_policy',
					},
					{
						label: translate( 'GDPR', {
							comment:
								'GDPR refers to the General Data Protection Regulation in effect in the European Union',
						} ),
						href: addQueryArgs( utmParams, 'https://jetpack.com/gdpr/' ),
						trackId: 'gdpr',
					},
					hideCaliforniaNotice
						? null
						: {
								label: translate( 'Privacy Notice for California Users' ),
								href: addQueryArgs(
									utmParams,
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									'https://automattic.com/privacy/#california-consumer-privacy-act-ccpa'
								),
								trackId: 'privacy_policy_california',
						  },
					shouldSeeDoNotSell
						? {
								label: translate( 'Do Not Sell or Share My Data' ),
								onClick: openDialog,
						  }
						: null,
				],
			},
			{
				category: translate( 'Help' ),
				items: [
					{
						label: translate( 'Knowledge Base' ),
						href: 'https://jetpack.com/support/',
						trackId: 'knowledge_base',
					},
					{
						label: translate( 'Forums' ),
						href: addQueryArgs( utmParams, 'https://wordpress.org/support/plugin/jetpack/' ),
						trackId: 'forums',
					},
					{
						label: translate( 'Webinars' ),
						href: 'https://jetpack.com/webinars/',
						trackId: 'webinars',
					},
					{
						label: translate( 'Reviews and Testimonials' ),
						href: 'https://jetpack.com/testimonials/',
						trackId: 'testimonials',
					},
					{
						label: translate( 'Security Library' ),
						href: 'https://jetpack.com/features/security/library',
						trackId: 'security_library',
					},
					{
						label: translate( 'Contact Us' ),
						href: 'https://jetpack.com/contact-support/',
						trackId: 'contact_us',
					},
					{
						label: translate( 'Press' ),
						href: 'https://jetpack.com/newsroom/',
						trackId: 'press',
					},
				],
			},
		];

		const socialProps = [
			{
				name: translate( 'Twitter' ),
				accessibleName: translate( 'Jetpack Twitter account' ),
				href: 'https://twitter.com/jetpack',
				icon: 'twitter-alt',
				trackId: 'twitter',
			},
			{
				name: translate( 'Facebook' ),
				accessibleName: translate( 'Jetpack Facebook page' ),
				href: 'https://www.facebook.com/jetpackme/',
				icon: 'facebook',
				trackId: 'facebook',
			},
			{
				name: translate( 'LinkedIn' ),
				accessibleName: translate( 'Jetpack LinkedIn page' ),
				href: 'hhttps://www.linkedin.com/company/jetpack-for-wordpress/',
				icon: 'linkedin',
				trackId: 'linkedin',
			},
			{
				name: translate( 'Youtube' ),
				accessibleName: translate( 'Jetpack Youtube channel' ),
				href: 'https://www.youtube.com/JetpackOfficial',
				icon: 'youtube',
				trackId: 'youtube',
			},
		];

		return {
			sitemap,
			socialProps,
		};
	}, [ translate, hideCaliforniaNotice, shouldSeeDoNotSell, openDialog ] );

	const onLanguageClick = useCallback(
		() => setLocaleSwitcherVisibility( true ),
		[ setLocaleSwitcherVisibility ]
	);
	const onLocaleSwitcherClose = useCallback(
		() => setLocaleSwitcherVisibility( false ),
		[ setLocaleSwitcherVisibility ]
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<footer>
			<LocalSwitcher isVisible={ isLocaleSwitcherVisible } onClose={ onLocaleSwitcherClose } />
			<div className="jetpack-footer">
				<div className="jetpack-footer__content">
					<div className="jetpack-footer__head">
						<ExternalLink
							className="jetpack-footer__home-link"
							href={ JPCOM_HOME }
							aria-label={ translate( 'Jetpack home' ) }
						>
							<JetpackLogo full />
						</ExternalLink>
						<div className="jetpack-footer__language">
							<button
								className="language-toggle jetpack-footer__language-toggle"
								aria-label={ translate( 'Select language' ) as string }
								onClick={ onLanguageClick }
							>
								<span>{ defaultLocale.toUpperCase() }</span>
								<Gridicon icon="chevron-down" size={ 18 } />
							</button>
						</div>
					</div>
					<nav
						className="jetpack-footer__sitemap sitemap"
						aria-label={ translate( 'Footer' ) as string }
					>
						<ul className="sitemap__list">
							{ sitemap.map( ( { category, items } ) => (
								<li key={ category as string } className="sitemap__category">
									<span className="sitemap__category-label">{ category }</span>
									<ul className="sitemap__link-list">
										{ items.map( ( item ) => {
											if ( ! item ) {
												return;
											}

											const { label, href, trackId, onClick } = item;

											if ( onClick ) {
												return (
													<li key={ label as string }>
														<ExternalLink className="sitemap__link" onClick={ onClick }>
															{ preventWidows( label ) }
														</ExternalLink>
													</li>
												);
											}

											return (
												<li key={ label as string }>
													<ExternalLink
														href={ href }
														className="sitemap__link"
														onClick={ getTrackLinkClick( trackId ) }
													>
														{ preventWidows( label ) }
													</ExternalLink>
												</li>
											);
										} ) }
									</ul>
								</li>
							) ) }
							<li className="sitemap__category sitemap__category-social">
								<span className="sitemap__category-label">{ translate( 'Social' ) }</span>
								<ul className="sitemap__link-list social-properties">
									{ socialProps.map( ( { name, accessibleName, href, icon, trackId } ) => (
										<li key={ name as string }>
											<ExternalLink
												className="sitemap__link"
												href={ href as string }
												onClick={ getTrackLinkClick( trackId ) }
											>
												<span className="social-properties__accessible-name">
													{ accessibleName }
												</span>
												<SocialLogo icon={ icon } aria-hidden />
											</ExternalLink>
										</li>
									) ) }
								</ul>
							</li>
							<li className="sitemap__category sitemap__category-mobile">
								<span className="sitemap__category-label">{ translate( 'Mobile Apps' ) }</span>
								<div className="store-buttons">
									<ul>
										<li>
											<ExternalLink
												href={ GOOGLE_PLAY_JETPACK_URL }
												onClick={ getTrackLinkClick( 'google-play' ) }
											>
												<img
													src={ googlePlayBadge }
													alt={ translate( 'Get Jetpack on Google Play' ) as string }
													height="40"
													width="135"
													loading="lazy"
												/>
											</ExternalLink>
										</li>
										<li>
											<ExternalLink
												href={ APP_STORE_JETPACK_URL }
												onClick={ getTrackLinkClick( 'app-store' ) }
											>
												<img
													src={ appStoreBadge }
													alt={ translate( 'Download Jetpack on the App Store' ) as string }
													height="40"
													width="120"
													loading="lazy"
												/>
											</ExternalLink>
										</li>
									</ul>
								</div>
							</li>
						</ul>
					</nav>
				</div>
			</div>
			<div className="a8c-footer">
				<ul className="a8c-footer__link-list">
					<li className="a8c-footer__home">
						<ExternalLink
							className="a8c-footer__home-link"
							href={ addQueryArgs( utmParams, A8C_HOME ) }
							onClick={ getTrackLinkClick( 'an_automattic_airline' ) }
						>
							{ translate( 'An {{logo/}} airline', {
								components: {
									logo: (
										<img
											className="a8c-footer__a8c-logo"
											src={ a8cLogo }
											alt={ translate( 'Automattic' ) as string }
											loading="lazy"
										/>
									),
								},
								comment:
									'{{logo/}} displays the Automattic logo. For translation purpose, an alternative string can be: Powered by Automattic',
							} ) }
						</ExternalLink>
					</li>
					<li className="a8c-footer__work">
						<ExternalLink
							className="a8c-footer__work-link"
							href={ addQueryArgs( utmParams, A8C_WORK ) }
							onClick={ getTrackLinkClick( 'automattic_is_hiring' ) }
						>
							{ translate( 'Work With Us' ) }
						</ExternalLink>
					</li>
				</ul>
			</div>
			{ shouldSeeDoNotSell && (
				<DoNotSellDialogContainer
					isOpen={ isDialogOpen }
					isActive={ isDoNotSell }
					onToggleActive={ onSetDoNotSell }
					onClose={ closeDialog }
				/>
			) }
		</footer>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default JetpackComFooter;
