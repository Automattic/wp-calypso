import config from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES,
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
import QueryProductsList from 'calypso/components/data/query-products-list';
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
import { getProductsList } from 'calypso/state/products-list/selectors';
import { isUserPaid } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { setThemePreviewOptions } from 'calypso/state/themes/actions';
import {
	doesThemeBundleSoftwareSet,
	isThemeActive,
	isThemePremium,
	isPremiumThemeAvailable,
	isSiteEligibleForBundledSoftware,
	isWpcomTheme as isThemeWpcom,
	isWporgTheme,
	getCanonicalTheme,
	getPremiumThemePrice,
	getThemeDetailsUrl,
	getThemeRequestErrors,
	getThemeForumUrl,
	getThemeDemoUrl,
	shouldShowTryAndCustomize,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import { getIsLoadingCart } from 'calypso/state/themes/selectors/get-is-loading-cart';
import { getBackPath } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeDownloadCard from './theme-download-card';
import ThemeFeaturesCard from './theme-features-card';
import ThemeNotFoundError from './theme-not-found-error';

import './style.scss';

class ThemeSheet extends Component {
	static displayName = 'ThemeSheet';

	static propTypes = {
		themeId: PropTypes.string,
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
		isThemePurchased: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isAtomic: PropTypes.bool,
		isStandaloneJetpack: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		backPath: PropTypes.string,
		isWpcomTheme: PropTypes.bool,
		softLaunched: PropTypes.bool,
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
		isExternallyManagedTheme: PropTypes.bool,
		isSiteEligibleForManagedExternalThemes: PropTypes.bool,
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
		if ( this.props.themeId !== prevProps.themeId ) {
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

	// If a theme has been removed by a theme shop, then the theme will still exist and a8c will take over any support responsibilities.
	isRemoved = () =>
		!! this.props.taxonomies?.theme_status?.find( ( status ) => status.slug === 'removed' );

	onButtonClick = () => {
		const { defaultOption, themeId } = this.props;
		defaultOption.action && defaultOption.action( themeId );
	};

	onSecondaryButtonClick = () => {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props.themeId );
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
			theme_name: this.props.themeId,
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
		const { author, name, translate, softLaunched } = this.props;

		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = name || placeholder;
		const tag = author ? translate( 'by %(author)s', { args: { author: author } } ) : placeholder;

		return (
			<div className="theme__sheet-bar">
				<span className="theme__sheet-bar-title">
					{ title }
					{ softLaunched && (
						<span className="theme__sheet-bar-soft-launched">{ translate( 'A8C Only' ) }</span>
					) }
				</span>
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
		this.props.setThemePreviewOptions(
			this.props.themeId,
			this.props.defaultOption,
			this.props.secondaryOption
		);
		return preview.action( this.props.themeId );
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
		const { siteSlug, themeId, demoUrl, translate, locale, isLoggedIn } = this.props;
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
							`/theme/${ themeId }${ section ? '/' + section : '' }${ sitePart }`,
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
					href="/help/contact/"
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

		const description = this.props.isWporg
			? this.props.translate( 'Get help from the theme author and WordPress.org community' )
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
					href={ localizeUrl( this.props.forumUrl ) }
					onClick={ this.trackThemeForumClick }
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
		const {
			defaultOption,
			isActive,
			isLoggedIn,
			isPremium,
			isThemePurchased,
			translate,
			isBundledSoftwareSet,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
		} = this.props;
		if ( isActive ) {
			// Customize site
			return (
				<span className="theme__sheet-customize-button">
					<Gridicon icon="external" />
					{ translate( 'Customize site' ) }
				</span>
			);
		} else if ( isLoggedIn ) {
			if (
				isPremium &&
				! isThemePurchased &&
				! isBundledSoftwareSet &&
				! isExternallyManagedTheme
			) {
				// purchase
				return translate( 'Pick this design' );
			} else if (
				isPremium &&
				! isThemePurchased &&
				isBundledSoftwareSet &&
				! isExternallyManagedTheme
			) {
				// upgrade plan
				return translate( 'Upgrade to activate', {
					comment:
						'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
				} );
			} else if (
				isExternallyManagedTheme &&
				! isMarketplaceThemeSubscribed &&
				! isSiteEligibleForManagedExternalThemes
			) {
				return translate( 'Upgrade to subscribe' );
			} else if (
				isExternallyManagedTheme &&
				! isMarketplaceThemeSubscribed &&
				isSiteEligibleForManagedExternalThemes
			) {
				return translate( 'Subscribe to activate' );
			}
			// else: activate
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

				{ this.isRemoved() && (
					<Card>
						<p>
							{ this.props.translate(
								'This theme has been renamed to reflect that support for it is now provided directly by WordPress.com. The theme will continue to work as before.'
							) }
						</p>
					</Card>
				) }
				<div className="theme__sheet-footer-line">
					<Gridicon icon="my-sites" />
				</div>
			</div>
		);
	};

	renderPrice = () => {
		let price = this.props.price;
		if ( ! this.isLoaded() || this.props.isActive || this.props.isBundledSoftwareSet ) {
			price = '';
		} else if ( ! this.props.isPremium && ! this.props.isExternallyManagedTheme ) {
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
		const { isActive, isExternallyManagedTheme } = this.props;
		const { isLoading } = this.props;

		return (
			<Button
				className="theme__sheet-primary-button"
				href={
					getUrl &&
					( ! isExternallyManagedTheme || ! config.isEnabled( 'themes/third-party-premium' ) )
						? getUrl( this.props.themeId )
						: null
				}
				onClick={ this.onButtonClick }
				primary
				disabled={ isLoading }
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
		const { backPath, locale, isLoggedIn } = this.props;
		page( localizeThemesPath( backPath, locale, ! isLoggedIn ) );
	};

	getBannerUpsellTitle = () => {
		const {
			isBundledSoftwareSet,
			isExternallyManagedTheme,
			translate,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
		} = this.props;

		if ( isBundledSoftwareSet && ! isExternallyManagedTheme ) {
			return translate( 'Access this WooCommerce theme with a Business plan!' );
		} else if ( isExternallyManagedTheme ) {
			if ( ! isMarketplaceThemeSubscribed && ! isSiteEligibleForManagedExternalThemes ) {
				return translate( 'Upgrade to a Business plan and subscribe to this theme!' );
			}
			return translate( 'Subscribe to this premium theme!' );
		}
		return translate( 'Access this theme for FREE with a Premium or Business plan!' );
	};

	getBannerUpsellDescription = () => {
		const {
			isBundledSoftwareSet,
			isExternallyManagedTheme,
			translate,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
		} = this.props;

		if ( isBundledSoftwareSet && ! isExternallyManagedTheme ) {
			return translate(
				'This theme comes bundled with the WooCommerce plugin. Upgrade to a Business plan to select this theme and unlock all its features.'
			);
		} else if ( isExternallyManagedTheme ) {
			if ( ! isMarketplaceThemeSubscribed && ! isSiteEligibleForManagedExternalThemes ) {
				return translate(
					'Unlock this theme by upgrading to a Business plan and subscribing to this premium theme.'
				);
			}
			return translate( 'Subscribe to this premium theme and unlock all its features.' );
		}
		return translate(
			'Instantly unlock all premium themes, more storage space, advanced customization, video support, and more when you upgrade.'
		);
	};

	renderSheet = () => {
		const section = this.validateSection( this.props.section );
		const {
			themeId,
			siteId,
			siteSlug,
			retired,
			hasUnlimitedPremiumThemes,
			isAtomic,
			isPremium,
			isBundledSoftwareSet,
			isSiteBundleEligible,
			isJetpack,
			isWpcomTheme,
			isVip,
			translate,
			canUserUploadThemes,
			isWPForTeamsSite,
			isLoggedIn,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
			isLoading,
		} = this.props;

		const analyticsPath = `/theme/${ themeId }${ section ? '/' + section : '' }${
			siteId ? '/:site' : ''
		}`;
		const analyticsPageTitle = `Themes > Details Sheet${
			section ? ' > ' + titlecase( section ) : ''
		}${ siteId ? ' > Site' : '' }`;

		let plansUrl = '/plans';

		if ( ! isLoggedIn ) {
			plansUrl = localizeUrl( 'https://wordpress.com/pricing' );
		} else if ( siteSlug ) {
			const plan = isExternallyManagedTheme || isBundledSoftwareSet ? PLAN_BUSINESS : PLAN_PREMIUM;
			plansUrl = plansUrl + `/${ siteSlug }/?plan=${ plan }`;
		}

		const launchPricing = () => window.open( plansUrl, '_blank' );

		const { canonicalUrl, description, name: themeName, seo_title, seo_description } = this.props;

		const title = seo_title
			? seo_title
			: translate( '%(themeName)s Theme', {
					args: { themeName },
			  } );

		const metas = [
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: this.props.screenshot },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		if ( seo_description || description ) {
			metas.push( {
				name: 'description',
				property: 'og:description',
				content: decodeEntities( seo_description || description ),
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
			( ! isJetpack && isPremium && ! hasUnlimitedPremiumThemes && ! isVip && ! retired ) ||
			isBundledSoftwareSet ||
			isExternallyManagedTheme;
		// Show theme upsell banner on Jetpack sites.
		const hasWpOrgThemeUpsellBanner =
			! isAtomic && ! isWpcomTheme && ( ! siteId || ( ! isJetpack && ! canUserUploadThemes ) );
		// Show theme upsell banner on Atomic sites.
		const hasThemeUpsellBannerAtomic =
			isAtomic && isPremium && ! canUserUploadThemes && ! hasUnlimitedPremiumThemes;

		const hasUpsellBanner =
			hasWpComThemeUpsellBanner || hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic;

		let onClick = null;

		if ( isExternallyManagedTheme ) {
			onClick = this.onButtonClick;
		} else if ( ! isLoggedIn ) {
			onClick = launchPricing;
		}

		const upsellNudgeClasses = classNames( 'theme__page-upsell-banner', {
			'theme__page-upsell-disabled': isLoading,
		} );

		if ( hasWpComThemeUpsellBanner ) {
			const forceDisplay =
				( isBundledSoftwareSet && ! isSiteBundleEligible ) ||
				( isExternallyManagedTheme &&
					( ! isMarketplaceThemeSubscribed || ! isSiteEligibleForManagedExternalThemes ) );

			const upsellNudgePlan =
				isExternallyManagedTheme || isBundledSoftwareSet ? PLAN_BUSINESS : PLAN_PREMIUM;
			pageUpsellBanner = (
				<UpsellNudge
					plan={ upsellNudgePlan }
					className={ upsellNudgeClasses }
					title={ this.getBannerUpsellTitle() }
					description={ preventWidows( this.getBannerUpsellDescription() ) }
					event="themes_plan_particular_free_with_plan"
					feature={ WPCOM_FEATURES_PREMIUM_THEMES }
					forceHref={ onClick === null }
					disableHref={ onClick !== null }
					onClick={ onClick }
					href={ plansUrl }
					showIcon={ true }
					forceDisplay={ forceDisplay }
					displayAsLink={ onClick !== null }
				/>
			);
		}

		if ( hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic ) {
			pageUpsellBanner = (
				<UpsellNudge
					plan={ PLAN_BUSINESS }
					className="theme__page-upsell-banner"
					title={ translate( 'Access this theme for FREE with a Business plan!' ) }
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
					event="theme_upsell_plan_click"
					tracksClickName="calypso_theme_upsell_plan_click"
					tracksClickProperties={ { theme_id: themeId, theme_name: themeName } }
				/>
			);
		}

		if ( hasUpsellBanner ) {
			previewUpsellBanner = cloneElement( pageUpsellBanner, {
				className: 'theme__preview-upsell-banner',
			} );
		}

		const isRemoved = this.isRemoved();

		const className = classNames( 'theme__sheet', { 'is-with-upsell-banner': hasUpsellBanner } );
		const columnsClassName = classNames( 'theme__sheet-columns', {
			'is-removed': isRemoved,
		} );

		return (
			<Main className={ className }>
				<QueryCanonicalTheme themeId={ this.props.themeId } siteId={ siteId } />
				<QueryProductsList />
				<QueryUserPurchases />
				{
					siteId && (
						<QuerySitePurchases siteId={ siteId } />
					) /* TODO: Make QuerySitePurchases handle falsey siteId */
				}
				<QuerySitePlans siteId={ siteId } />
				<DocumentHead title={ title } meta={ metas } />
				<PageViewTracker
					path={ analyticsPath }
					title={ analyticsPageTitle }
					properties={ { is_logged_in: isLoggedIn } }
				/>
				{ this.renderBar() }
				<QueryActiveTheme siteId={ siteId } />
				<ThanksModal source="details" themeId={ this.props.themeId } />
				<AutoLoadingHomepageModal source="details" />
				{ pageUpsellBanner }
				<HeaderCake
					className="theme__sheet-action-bar"
					backText={ translate( 'All Themes' ) }
					onClick={ this.goBack }
				>
					{ ! retired && ! hasWpOrgThemeUpsellBanner && ! isWPForTeamsSite && this.renderButton() }
				</HeaderCake>
				<div className={ columnsClassName }>
					<div className="theme__sheet-column-left">
						{ ! retired && this.renderSectionContent( section ) }
						{ retired && this.renderRetired() }
					</div>
					{ ! isRemoved && (
						<div className="theme__sheet-column-right">{ this.renderScreenshot() }</div>
					) }
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
		isThemePurchased,
		isStandaloneJetpack,
		demoUrl,
		showTryAndCustomize,
		isBundledSoftwareSet,
		isExternallyManagedTheme,
		isSiteEligibleForManagedExternalThemes,
		isMarketplaceThemeSubscribed,
	} = props;

	let defaultOption;
	let secondaryOption = 'tryandcustomize';
	const needsJetpackPlanUpgrade = isStandaloneJetpack && isPremium && ! isThemePurchased;

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
	} else if ( isExternallyManagedTheme && ! isSiteEligibleForManagedExternalThemes ) {
		defaultOption = 'upgradePlanForExternallyManagedThemes';
	} else if (
		isExternallyManagedTheme &&
		isSiteEligibleForManagedExternalThemes &&
		! isMarketplaceThemeSubscribed
	) {
		defaultOption = 'subscribe';
	} else if ( isPremium && ! isThemePurchased && ! isBundledSoftwareSet ) {
		defaultOption = 'purchase';
	} else if ( isPremium && ! isThemePurchased && isBundledSoftwareSet ) {
		defaultOption = 'upgradePlanForBundledThemes';
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
		const themeId = id;
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const isWpcomTheme = isThemeWpcom( state, themeId );
		const backPath = getBackPath( state );
		const isCurrentUserPaid = isUserPaid( state );
		const theme = getCanonicalTheme( state, siteId, themeId );
		const siteIdOrWpcom = siteId || 'wpcom';
		const error = theme ? false : getThemeRequestErrors( state, themeId, siteIdOrWpcom );
		const englishUrl = 'https://wordpress.com' + getThemeDetailsUrl( state, themeId );

		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const isStandaloneJetpack = isJetpack && ! isAtomic;

		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, theme?.id );
		const isLoading =
			getIsLoadingCart( state ) ||
			( isExternallyManagedTheme && Object.values( getProductsList( state ) ).length === 0 );

		const isMarketplaceThemeSubscribed =
			isExternallyManagedTheme && getIsMarketplaceThemeSubscribed( state, theme?.id, siteId );

		return {
			...theme,
			themeId,
			price: getPremiumThemePrice( state, themeId, siteId ),
			error,
			siteId,
			siteSlug,
			backPath,
			isCurrentUserPaid,
			isWpcomTheme,
			isWporg: isWporgTheme( state, themeId ),
			isLoggedIn: isUserLoggedIn( state ),
			isActive: isThemeActive( state, themeId, siteId ),
			isJetpack,
			isAtomic,
			isStandaloneJetpack,
			isVip: isVipSite( state, siteId ),
			isPremium: isThemePremium( state, themeId ),
			isThemePurchased: isPremiumThemeAvailable( state, themeId, siteId ),
			isBundledSoftwareSet: doesThemeBundleSoftwareSet( state, themeId ),
			isSiteBundleEligible: isSiteEligibleForBundledSoftware( state, siteId ),
			forumUrl: getThemeForumUrl( state, themeId, siteId ),
			hasUnlimitedPremiumThemes: siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES ),
			showTryAndCustomize: shouldShowTryAndCustomize( state, themeId, siteId ),
			canUserUploadThemes: siteHasFeature( state, siteId, FEATURE_UPLOAD_THEMES ),
			// Remove the trailing slash because the page URL doesn't have one either.
			canonicalUrl: localizeUrl( englishUrl, getLocaleSlug(), false ).replace( /\/$/, '' ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			softLaunched: theme?.soft_launched,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes: getIsSiteEligibleForManagedExternalThemes(
				state,
				siteId
			),
			isLoading,
			isMarketplaceThemeSubscribed,
		};
	},
	{
		setThemePreviewOptions,
		recordTracksEvent,
	}
)( localize( ThemeSheetWithOptions ) );
