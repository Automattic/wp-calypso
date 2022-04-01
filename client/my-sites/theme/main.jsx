import config from '@automattic/calypso-config';
import {
	FEATURE_PREMIUM_THEMES,
	FEATURE_UPLOAD_THEMES,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import page from 'page';
import photon from 'photon';
import PropTypes from 'prop-types';
import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import AsyncLoad from 'calypso/components/async-load';
import Badge from 'calypso/components/badge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { connectOptions } from 'calypso/my-sites/themes/theme-options';
import ThemePreview from 'calypso/my-sites/themes/theme-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isUserPaid } from 'calypso/state/purchases/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { setThemePreviewOptions } from 'calypso/state/themes/actions';
import {
	isThemeActive,
	isThemePremium,
	isPremiumThemeAvailable,
	isWpcomTheme as isThemeWpcom,
	getCanonicalTheme,
	getPremiumThemePrice,
	getThemeDetailsUrl,
	getThemeRequestErrors,
	getThemeForumUrl,
	getThemeDemoUrl,
	shouldShowTryAndCustomize,
} from 'calypso/state/themes/selectors';
import { getBackPath } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeDownloadCard from './theme-download-card';
import ThemeFeaturesCard from './theme-features-card';
import ThemeNotFoundError from './theme-not-found-error';

import './style.scss';

class ThemeSheet extends Component {
	static displayName = 'ThemeSheet';

	static propTypes = {
		id: PropTypes.string,
		name: PropTypes.string,
		author: PropTypes.string,
		screenshot: PropTypes.string,
		screenshots: PropTypes.array,
		price: PropTypes.string,
		description: PropTypes.string,
		descriptionLong: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.bool, // happens if no content: false
		] ),
		supportDocumentation: PropTypes.string,
		download: PropTypes.string,
		taxonomies: PropTypes.object,
		stylesheet: PropTypes.string,
		retired: PropTypes.bool,
		// Connected props
		isLoggedIn: PropTypes.bool,
		isActive: PropTypes.bool,
		isPurchased: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isAtomic: PropTypes.bool,
		isStandaloneJetpack: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		backPath: PropTypes.string,
		isWpcomTheme: PropTypes.bool,
		defaultOption: PropTypes.shape( {
			label: PropTypes.string,
			action: PropTypes.func,
			getUrl: PropTypes.func,
		} ),
		secondaryOption: PropTypes.shape( {
			label: PropTypes.string,
			action: PropTypes.func,
			getUrl: PropTypes.func,
		} ),
	};

	static defaultProps = {
		section: '',
	};

	scrollToTop = () => {
		window.scroll( 0, 0 );
	};

	componentDidMount() {
		this.scrollToTop();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.id !== prevProps.id ) {
			this.scrollToTop();
		}
	}

	isLoaded = () => {
		// We need to make sure the theme object has been loaded including full details
		// (and not just without, as would've been stored by the `<QueryThemes />` (plural!)
		// component used by the theme showcase's list view). However, these extra details
		// aren't present for non-wpcom themes.
		if ( ! this.props.isWpcomTheme ) {
			return !! this.props.name;
		}
		return !! this.props.screenshots;
	};

	onButtonClick = () => {
		const { defaultOption, id } = this.props;
		defaultOption.action && defaultOption.action( id );
	};

	onSecondaryButtonClick = () => {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props.id );
	};

	getValidSections = () => {
		const validSections = [];
		validSections.push( '' ); // Default section

		if ( ! this.props.isPremium && this.props.supportDocumentation ) {
			validSections.push( 'setup' );
		}

		validSections.push( 'support' );
		return validSections;
	};

	validateSection = ( section ) => {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[ 0 ];
		}
		return section;
	};

	trackButtonClick = ( context ) => {
		this.props.recordTracksEvent( 'calypso_theme_sheet_button_click', {
			theme_name: this.props.id,
			button_context: context,
		} );
	};

	trackContactUsClick = () => {
		this.trackButtonClick( 'help' );
	};

	trackThemeForumClick = () => {
		this.trackButtonClick( 'theme_forum' );
	};

	trackCssClick = () => {
		this.trackButtonClick( 'css_forum' );
	};

	renderBar = () => {
		const { author, name, translate } = this.props;

		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = name || placeholder;
		const tag = author ? translate( 'by %(author)s', { args: { author: author } } ) : placeholder;

		return (
			<div className="theme__sheet-bar">
				<span className="theme__sheet-bar-title">{ title }</span>
				<span className="theme__sheet-bar-tag">{ tag }</span>
			</div>
		);
	};

	getFullLengthScreenshot() {
		if ( this.isLoaded() ) {
			// Results are being returned with photon params like `?w=…`. This makes the photon
			// module abort and return null. Strip query string.
			return this.props.screenshots[ 0 ]?.replace( /\?.*/, '' );
		}
		return null;
	}

	previewAction = ( event, type ) => {
		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			return;
		}
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_theme_live_demo_preview_click', { type } );

		const { preview } = this.props.options;
		this.props.setThemePreviewOptions( this.props.defaultOption, this.props.secondaryOption );
		return preview.action( this.props.id );
	};

	shouldRenderPreviewButton() {
		const { isWPForTeamsSite } = this.props;
		return this.isThemeAvailable() && ! this.isThemeCurrentOne() && ! isWPForTeamsSite;
	}

	isThemeCurrentOne() {
		return this.props.isActive;
	}

	isThemeAvailable() {
		const { demoUrl, retired } = this.props;
		return demoUrl && ! retired;
	}

	// Render "Open Live Demo" pseudo-button for mobiles.
	// This is a legacy hack that shows the button under the preview screenshot for mobiles
	// but not for desktop (becomes hidden behind the screenshot).
	renderPreviewButton() {
		return (
			<div className="theme__sheet-preview-link">
				<span className="theme__sheet-preview-link-text">
					{ this.props.translate( 'Open live demo', {
						context: 'Individual theme live preview button',
					} ) }
				</span>
			</div>
		);
	}

	renderScreenshot() {
		const { isWpcomTheme, name: themeName, demoUrl, translate } = this.props;
		const screenshotFull = isWpcomTheme ? this.getFullLengthScreenshot() : this.props.screenshot;
		const width = 735;
		// Photon may return null, allow fallbacks
		const photonSrc = screenshotFull && photon( screenshotFull, { width } );
		const img = screenshotFull && (
			<img
				alt={
					// translators: %s is the theme name. Eg Twenty Twenty.
					translate( 'Screenshot of the %(themeName)s theme', {
						args: { themeName },
					} )
				}
				className="theme__sheet-img"
				src={ photonSrc || screenshotFull }
				srcSet={ photonSrc && `${ photon( screenshotFull, { width, zoom: 2 } ) } 2x` }
			/>
		);

		if ( this.isThemeAvailable() ) {
			return (
				<a
					className="theme__sheet-screenshot is-active"
					href={ demoUrl }
					onClick={ ( e ) => {
						this.previewAction( e, 'screenshot' );
					} }
					rel="noopener noreferrer"
				>
					{ this.shouldRenderPreviewButton() && this.renderPreviewButton() }
					{ img }
				</a>
			);
		}

		return <div className="theme__sheet-screenshot">{ img }</div>;
	}

	renderSectionNav = ( currentSection ) => {
		const { siteSlug, id, demoUrl, translate, locale, isLoggedIn } = this.props;
		const filterStrings = {
			'': translate( 'Overview', { context: 'Filter label for theme content' } ),
			setup: translate( 'Setup', { context: 'Filter label for theme content' } ),
			support: translate( 'Support', { context: 'Filter label for theme content' } ),
		};
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nav = (
			<NavTabs label="Details">
				{ this.getValidSections().map( ( section ) => (
					<NavItem
						key={ section }
						path={ localizeThemesPath(
							`/theme/${ id }${ section ? '/' + section : '' }${ sitePart }`,
							locale,
							! isLoggedIn
						) }
						selected={ section === currentSection }
					>
						{ filterStrings[ section ] }
					</NavItem>
				) ) }
				{ this.shouldRenderPreviewButton() ? (
					<NavItem
						path={ demoUrl }
						onClick={ ( e ) => {
							this.previewAction( e, 'link' );
						} }
						className="theme__sheet-preview-nav-item"
					>
						{ translate( 'Open live demo', {
							context: 'Individual theme live preview button',
						} ) }
					</NavItem>
				) : null }
			</NavTabs>
		);

		return (
			<SectionNav
				className="theme__sheet-section-nav"
				selectedText={ filterStrings[ currentSection ] }
			>
				{ this.isLoaded() && nav }
			</SectionNav>
		);
	};

	renderSectionContent = ( section ) => {
		const activeSection = {
			'': this.renderOverviewTab(),
			setup: this.renderSetupTab(),
			support: this.renderSupportTab(),
		}[ section ];

		return (
			<div className="theme__sheet-content">
				{ config.isEnabled( 'jitms' ) && this.props.siteSlug && (
					<AsyncLoad
						require="calypso/blocks/jitm"
						placeholder={ null }
						messagePath="calypso:theme:admin_notices"
					/>
				) }
				{ this.renderSectionNav( section ) }
				{ activeSection }
				<div className="theme__sheet-footer-line">
					<Gridicon icon="my-sites" />
				</div>
			</div>
		);
	};

	renderDescription = () => {
		if ( this.props.descriptionLong ) {
			// eslint-disable-next-line react/no-danger
			return <div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />;
		}
		// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
		return <div>{ this.props.description }</div>;
	};

	renderNextTheme = () => {
		const { next, siteSlug, translate, locale, isLoggedIn } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nextThemeHref = localizeThemesPath(
			`/theme/${ next }${ sitePart }`,
			locale,
			! isLoggedIn
		);
		return <SectionHeader href={ nextThemeHref } label={ translate( 'Next theme' ) } />;
	};

	renderOverviewTab = () => {
		const { download, isWpcomTheme, siteSlug, taxonomies, isPremium } = this.props;

		return (
			<div>
				<Card className="theme__sheet-content">{ this.renderDescription() }</Card>
				<ThemeFeaturesCard
					taxonomies={ taxonomies }
					siteSlug={ siteSlug }
					isWpcomTheme={ isWpcomTheme }
				/>
				{ download && ! isPremium && <ThemeDownloadCard href={ download } /> }
				{ isWpcomTheme && this.renderNextTheme() }
			</div>
		);
	};

	renderSetupTab = () => {
		/* eslint-disable react/no-danger */
		return (
			<div>
				<Card className="theme__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />
				</Card>
			</div>
		);
		/* eslint-enable react/no-danger */
	};

	renderSupportContactUsCard = ( buttonCount ) => {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ this.props.translate( 'Need extra help?' ) }
					<small>{ this.props.translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href={ '/help/contact/' }
					onClick={ this.trackContactUsClick }
				>
					{ this.props.translate( 'Contact us' ) }
				</Button>
			</Card>
		);
	};

	renderSupportThemeForumCard = ( buttonCount ) => {
		if ( ! this.props.forumUrl ) {
			return null;
		}

		const description = this.props.isPremium
			? this.props.translate( 'Get in touch with the theme author' )
			: this.props.translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ this.props.translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href={ this.props.forumUrl }
					onClick={ this.trackThemeForumClick }
				>
					{ this.props.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	};

	renderSupportCssCard = ( buttonCount ) => {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="briefcase" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ this.props.translate( 'Need CSS help? ' ) }
					<small>{ this.props.translate( 'Get help from the experts in our CSS forum' ) }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href="//en.forums.wordpress.com/forum/css-customization"
					onClick={ this.trackCssClick }
				>
					{ this.props.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	};

	renderSupportTab = () => {
		const {
			author,
			isCurrentUserPaid,
			isStandaloneJetpack,
			forumUrl,
			isWpcomTheme,
			isLoggedIn,
			translate,
		} = this.props;
		let buttonCount = 1;
		let renderedTab = null;

		if ( isLoggedIn ) {
			renderedTab = (
				<div>
					{ isCurrentUserPaid &&
						( isWpcomTheme || author === 'Automattic' ) &&
						! isStandaloneJetpack &&
						this.renderSupportContactUsCard( buttonCount++ ) }
					{ forumUrl && this.renderSupportThemeForumCard( buttonCount++ ) }
					{ isWpcomTheme && this.renderSupportCssCard( buttonCount++ ) }
				</div>
			);

			// No card has been rendered
			if ( buttonCount === 1 ) {
				renderedTab = (
					<Card className="theme__sheet-card-support">
						<Gridicon icon="notice-outline" size={ 48 } />
						<div className="theme__sheet-card-support-details">
							{ translate(
								'Help and support for this theme is not offered by WordPress.com. {{InlineSupportLink/}}',
								{
									components: {
										InlineSupportLink: (
											<InlineSupportLink supportContext="themes-unsupported" showIcon={ false } />
										),
									},
								}
							) }
							<small>
								{ translate( 'Contact the theme developer directly for help with this theme.' ) }
							</small>
						</div>
					</Card>
				);
			}
		} else {
			// Logged out
			renderedTab = (
				<Card className="theme__sheet-card-support">
					<Gridicon icon="help" size={ 48 } />
					<div className="theme__sheet-card-support-details">
						{ translate( 'Have a question about this theme?' ) }
						<small>
							{ translate( 'Pick this design and start a site with us, we can help!', {
								context: 'Logged out theme support message',
							} ) }
						</small>
					</div>
				</Card>
			);
		}

		return renderedTab;
	};

	getDefaultOptionLabel = () => {
		const { defaultOption, isActive, isLoggedIn, isPremium, isPurchased, translate } = this.props;
		if ( isActive ) {
			// Customize site
			return (
				<span className="theme__sheet-customize-button">
					<Gridicon icon="external" />
					{ translate( 'Customize site' ) }
				</span>
			);
		} else if ( isLoggedIn ) {
			if ( isPremium && ! isPurchased ) {
				// purchase
				return translate( 'Pick this design' );
			} // else: activate
			return translate( 'Activate this design' );
		}
		return defaultOption.label;
	};

	renderRetired = () => {
		const { translate, locale, isLoggedIn } = this.props;
		return (
			<div className="theme__sheet-content">
				<Card className="theme__retired-theme-message">
					<Gridicon icon="cross-circle" size={ 48 } />
					<div className="theme__retired-theme-message-details">
						<div className="theme__retired-theme-message-details-title">
							{ this.props.translate( 'This theme is retired' ) }
							<InlineSupportLink supportContext="themes-retired" showText={ false } />
						</div>
						<div>
							{ this.props.translate(
								'We invite you to try out a newer theme; start by browsing our WordPress theme directory.'
							) }
						</div>
					</div>
					<Button primary={ true } href={ localizeThemesPath( '/themes/', locale, ! isLoggedIn ) }>
						{ translate( 'See all themes' ) }
					</Button>
				</Card>

				<div className="theme__sheet-footer-line">
					<Gridicon icon="my-sites" />
				</div>
			</div>
		);
	};

	renderPrice = () => {
		let price = this.props.price;
		if ( ! this.isLoaded() || this.props.isActive ) {
			price = '';
		} else if ( ! this.props.isPremium ) {
			price = this.props.translate( 'Free' );
		}

		const className = classNames( 'theme__sheet-action-bar-cost', {
			'theme__sheet-action-bar-cost-upgrade': ! /\d/g.test( this.props.price ),
		} );

		return price ? <span className={ className }>{ price }</span> : '';
	};

	renderButton = () => {
		const { getUrl } = this.props.defaultOption;
		const label = this.getDefaultOptionLabel();
		const price = this.renderPrice();
		const placeholder = <span className="theme__sheet-button-placeholder">loading......</span>;
		const { isActive } = this.props;

		return (
			<Button
				className="theme__sheet-primary-button"
				href={ getUrl ? getUrl( this.props.id ) : null }
				onClick={ this.onButtonClick }
				primary
				target={ isActive ? '_blank' : null }
			>
				{ this.isLoaded() ? label : placeholder }
				{ price && this.props.isWpcomTheme && (
					<Badge type="info" className="theme__sheet-badge-beta">
						{ price }
					</Badge>
				) }
			</Button>
		);
	};

	goBack = () => {
		const { previousRoute, backPath, locale, isLoggedIn } = this.props;
		if ( previousRoute ) {
			page.back( previousRoute );
		} else {
			page( localizeThemesPath( backPath, locale, ! isLoggedIn ) );
		}
	};

	renderSheet = () => {
		const section = this.validateSection( this.props.section );
		const {
			id,
			siteId,
			siteSlug,
			retired,
			hasUnlimitedPremiumThemes,
			isAtomic,
			isPremium,
			isJetpack,
			isWpcomTheme,
			isVip,
			translate,
			canUserUploadThemes,
			previousRoute,
			isWPForTeamsSite,
		} = this.props;

		const analyticsPath = `/theme/${ id }${ section ? '/' + section : '' }${
			siteId ? '/:site' : ''
		}`;
		const analyticsPageTitle = `Themes > Details Sheet${
			section ? ' > ' + titlecase( section ) : ''
		}${ siteId ? ' > Site' : '' }`;

		const plansUrl = siteSlug ? `/plans/${ siteSlug }/?plan=value_bundle` : '/plans';

		const { canonicalUrl, description, name: themeName } = this.props;
		const title =
			themeName &&
			translate( '%(themeName)s Theme', {
				args: { themeName },
			} );

		const metas = [
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: this.props.screenshot },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		if ( description ) {
			metas.push( {
				name: 'description',
				property: 'og:description',
				content: decodeEntities( description ),
			} );
		}

		if ( this.props.retired ) {
			metas.push( {
				name: 'robots',
				content: 'noindex',
			} );
		}

		let pageUpsellBanner;
		let previewUpsellBanner;

		// Show theme upsell banner on Simple sites.
		const hasWpComThemeUpsellBanner =
			! isJetpack && isPremium && ! hasUnlimitedPremiumThemes && ! isVip && ! retired;
		// Show theme upsell banner on Jetpack sites.
		const hasWpOrgThemeUpsellBanner =
			! isAtomic && ! isWpcomTheme && ( ! siteId || ( ! isJetpack && ! canUserUploadThemes ) );
		// Show theme upsell banner on Atomic sites.
		const hasThemeUpsellBannerAtomic =
			isAtomic && isPremium && ! canUserUploadThemes && ! hasUnlimitedPremiumThemes;

		const hasUpsellBanner =
			hasWpComThemeUpsellBanner || hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic;

		if ( hasWpComThemeUpsellBanner ) {
			pageUpsellBanner = (
				<UpsellNudge
					plan={ PLAN_WPCOM_PRO }
					className="theme__page-upsell-banner"
					title={ translate( 'Access this theme for FREE with a Pro plan!' ) }
					description={ preventWidows(
						translate(
							'Instantly unlock all premium themes, more storage space, advanced customization, video support, and more when you upgrade.'
						)
					) }
					event="themes_plan_particular_free_with_plan"
					feature={ FEATURE_PREMIUM_THEMES }
					forceHref={ true }
					href={ plansUrl }
					showIcon={ true }
				/>
			);
		}

		if ( hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic ) {
			pageUpsellBanner = (
				<UpsellNudge
					plan={ PLAN_WPCOM_PRO }
					className="theme__page-upsell-banner"
					title={ translate( 'Access this theme for FREE with a Pro plan!' ) }
					description={ preventWidows(
						translate(
							'Instantly unlock thousands of different themes and install your own when you upgrade.'
						)
					) }
					forceHref
					feature={ FEATURE_UPLOAD_THEMES }
					forceDisplay
					href={ ! siteId ? '/plans' : null }
					showIcon
				/>
			);
		}

		if ( hasUpsellBanner ) {
			previewUpsellBanner = cloneElement( pageUpsellBanner, {
				className: 'theme__preview-upsell-banner',
			} );
		}

		const className = classNames( 'theme__sheet', { 'is-with-upsell-banner': hasUpsellBanner } );

		return (
			<Main className={ className }>
				<QueryCanonicalTheme themeId={ this.props.id } siteId={ siteId } />
				<QueryUserPurchases />
				{
					siteId && (
						<QuerySitePurchases siteId={ siteId } />
					) /* TODO: Make QuerySitePurchases handle falsey siteId */
				}
				<QuerySitePlans siteId={ siteId } />
				<DocumentHead title={ title } meta={ metas } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
				{ this.renderBar() }
				<QueryActiveTheme siteId={ siteId } />
				<ThanksModal source={ 'details' } />
				<AutoLoadingHomepageModal source={ 'details' } />
				{ pageUpsellBanner }
				<HeaderCake
					className="theme__sheet-action-bar"
					backText={ previousRoute ? translate( 'Back' ) : translate( 'All Themes' ) }
					onClick={ this.goBack }
				>
					{ ! retired && ! hasWpOrgThemeUpsellBanner && ! isWPForTeamsSite && this.renderButton() }
				</HeaderCake>
				<div className="theme__sheet-columns">
					<div className="theme__sheet-column-left">
						{ ! retired && this.renderSectionContent( section ) }
						{ retired && this.renderRetired() }
					</div>
					<div className="theme__sheet-column-right">{ this.renderScreenshot() }</div>
				</div>
				<ThemePreview belowToolbar={ previewUpsellBanner } />
				<PerformanceTrackerStop />
			</Main>
		);
	};

	render() {
		if ( this.props.error ) {
			return <ThemeNotFoundError />;
		}
		return this.renderSheet();
	}
}

const ConnectedThemeSheet = connectOptions( ThemeSheet );

const ThemeSheetWithOptions = ( props ) => {
	const {
		siteId,
		isActive,
		isLoggedIn,
		isPremium,
		isPurchased,
		isJetpack,
		demoUrl,
		showTryAndCustomize,
	} = props;

	let defaultOption;
	let secondaryOption = 'tryandcustomize';
	const needsJetpackPlanUpgrade = isJetpack && isPremium && ! isPurchased;

	if ( ! showTryAndCustomize ) {
		secondaryOption = null;
	}

	if ( ! isLoggedIn ) {
		defaultOption = 'signup';
		secondaryOption = null;
	} else if ( isActive ) {
		defaultOption = 'customize';
	} else if ( needsJetpackPlanUpgrade ) {
		defaultOption = 'upgradePlan';
	} else if ( isPremium && ! isPurchased ) {
		defaultOption = 'purchase';
	} else {
		defaultOption = 'activate';
	}

	return (
		<ConnectedThemeSheet
			{ ...props }
			demo_uri={ demoUrl }
			siteId={ siteId }
			defaultOption={ defaultOption }
			secondaryOption={ secondaryOption }
			source="showcase-sheet"
		/>
	);
};

export default connect(
	( state, { id } ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const isWpcomTheme = isThemeWpcom( state, id );
		const backPath = getBackPath( state );
		const isCurrentUserPaid = isUserPaid( state );
		const theme = getCanonicalTheme( state, siteId, id );
		const siteIdOrWpcom = siteId || 'wpcom';
		const error = theme ? false : getThemeRequestErrors( state, id, siteIdOrWpcom );
		const englishUrl = 'https://wordpress.com' + getThemeDetailsUrl( state, id );

		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const isStandaloneJetpack = isJetpack && ! isAtomic;

		return {
			...theme,
			id,
			price: getPremiumThemePrice( state, id, siteId ),
			error,
			siteId,
			siteSlug,
			backPath,
			isCurrentUserPaid,
			isWpcomTheme,
			isLoggedIn: isUserLoggedIn( state ),
			isActive: isThemeActive( state, id, siteId ),
			isJetpack,
			isAtomic,
			isStandaloneJetpack,
			isVip: isVipSite( state, siteId ),
			isPremium: isThemePremium( state, id ),
			isPurchased: isPremiumThemeAvailable( state, id, siteId ),
			forumUrl: getThemeForumUrl( state, id, siteId ),
			hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_PREMIUM_THEMES ),
			showTryAndCustomize: shouldShowTryAndCustomize( state, id, siteId ),
			canUserUploadThemes: hasFeature( state, siteId, FEATURE_UPLOAD_THEMES ),
			// Remove the trailing slash because the page URL doesn't have one either.
			canonicalUrl: localizeUrl( englishUrl, getLocaleSlug(), false ).replace( /\/$/, '' ),
			demoUrl: getThemeDemoUrl( state, id, siteId ),
			previousRoute: getPreviousRoute( state ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		};
	},
	{
		setThemePreviewOptions,
		recordTracksEvent,
	}
)( localize( ThemeSheetWithOptions ) );
