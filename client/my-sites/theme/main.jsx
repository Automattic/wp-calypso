/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import classNames from 'classnames';
import config from 'config';
import titlecase from 'to-title-case';
import Gridicon from 'components/gridicon';
import { head, split } from 'lodash';
import photon from 'photon';
import page from 'page';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import ThemeDownloadCard from './theme-download-card';
import ThemePreview from 'my-sites/themes/theme-preview';
import Banner from 'components/banner';
import { Button, Card } from '@automattic/components';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isUserPaid } from 'state/purchases/selectors';
import ThanksModal from 'my-sites/themes/thanks-modal';
import AutoLoadingHomepageModal from 'my-sites/themes/auto-loading-homepage-modal';

import QueryActiveTheme from 'components/data/query-active-theme';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemesSiteSelectorModal from 'my-sites/themes/themes-site-selector-modal';
import { connectOptions } from 'my-sites/themes/theme-options';
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
} from 'state/themes/selectors';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { setThemePreviewOptions } from 'state/themes/actions';
import ThemeNotFoundError from './theme-not-found-error';
import ThemeFeaturesCard from './theme-features-card';
import { FEATURE_UNLIMITED_PREMIUM_THEMES, PLAN_PREMIUM } from 'lib/plans/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import getPreviousRoute from 'state/selectors/get-previous-route';

/**
 * Style dependencies
 */
import './style.scss';

class ThemeSheet extends React.Component {
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

	UNSAFE_componentWillUpdate( nextProps ) {
		if ( nextProps.id !== this.props.id ) {
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
		this.props.supportDocumentation && validSections.push( 'setup' );
		validSections.push( 'support' );
		return validSections;
	};

	validateSection = section => {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[ 0 ];
		}
		return section;
	};

	trackButtonClick = context => {
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
		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = this.props.name || placeholder;
		const tag = this.props.author
			? i18n.translate( 'by %(author)s', { args: { author: this.props.author } } )
			: placeholder;

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
			return head( split( head( this.props.screenshots ), '?', 1 ) );
		}
		return null;
	}

	previewAction = event => {
		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			return;
		}
		event.preventDefault();

		const { preview } = this.props.options;
		this.props.setThemePreviewOptions( this.props.defaultOption, this.props.secondaryOption );
		return preview.action( this.props.id );
	};

	shouldRenderPreviewButton() {
		return this.isThemeAvailable() && ! this.isThemeCurrentOne();
	}

	isThemeCurrentOne() {
		return this.props.isActive;
	}

	isThemeAvailable() {
		const { demo_uri, retired } = this.props;
		return demo_uri && ! retired;
	}

	// Render "Open Live Demo" pseudo-button for mobiles.
	// This is a legacy hack that shows the button under the preview screenshot for mobiles
	// but not for desktop (becomes hidden behind the screenshot).
	renderPreviewButton() {
		return (
			<div className="theme__sheet-preview-link">
				<span className="theme__sheet-preview-link-text">
					{ i18n.translate( 'Open Live Demo', {
						context: 'Individual theme live preview button',
					} ) }
				</span>
			</div>
		);
	}

	renderScreenshot() {
		const { isWpcomTheme, name: themeName } = this.props;
		const screenshotFull = isWpcomTheme ? this.getFullLengthScreenshot() : this.props.screenshot;
		const width = 735;
		// Photon may return null, allow fallbacks
		const photonSrc = screenshotFull && photon( screenshotFull, { width } );
		const img = screenshotFull && (
			<img
				alt={
					// translators: %s is the theme name. Eg Twenty Twenty.
					i18n.translate( 'Screenshot of the %(themeName)s theme', {
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
					href={ this.props.demo_uri }
					onClick={ this.previewAction }
					rel="noopener noreferrer"
				>
					{ this.shouldRenderPreviewButton() && this.renderPreviewButton() }
					{ img }
				</a>
			);
		}

		return <div className="theme__sheet-screenshot">{ img }</div>;
	}

	renderSectionNav = currentSection => {
		const filterStrings = {
			'': i18n.translate( 'Overview', { context: 'Filter label for theme content' } ),
			setup: i18n.translate( 'Setup', { context: 'Filter label for theme content' } ),
			support: i18n.translate( 'Support', { context: 'Filter label for theme content' } ),
		};

		const { siteSlug, id } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nav = (
			<NavTabs label="Details">
				{ this.getValidSections().map( section => (
					<NavItem
						key={ section }
						path={ `/theme/${ id }${ section ? '/' + section : '' }${ sitePart }` }
						selected={ section === currentSection }
					>
						{ filterStrings[ section ] }
					</NavItem>
				) ) }
				{ this.shouldRenderPreviewButton() ? (
					<NavItem
						path={ this.props.demo_uri }
						onClick={ this.previewAction }
						className="theme__sheet-preview-nav-item"
					>
						{ i18n.translate( 'Open Live Demo', {
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

	renderSectionContent = section => {
		const activeSection = {
			'': this.renderOverviewTab(),
			setup: this.renderSetupTab(),
			support: this.renderSupportTab(),
		}[ section ];

		return (
			<div className="theme__sheet-content">
				{ config.isEnabled( 'jitms' ) && this.props.siteSlug && (
					<AsyncLoad require="blocks/jitm" messagePath={ 'calypso:theme:admin_notices' } />
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
		const { next, siteSlug } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nextThemeHref = `/theme/${ next }${ sitePart }`;
		return <SectionHeader href={ nextThemeHref } label={ i18n.translate( 'Next theme' ) } />;
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

	renderSupportContactUsCard = buttonCount => {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Need extra help?' ) }
					<small>{ i18n.translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href={ '/help/contact/' }
					onClick={ this.trackContactUsClick }
				>
					{ i18n.translate( 'Contact us' ) }
				</Button>
			</Card>
		);
	};

	renderSupportThemeForumCard = buttonCount => {
		if ( ! this.props.forumUrl ) {
			return null;
		}

		const description = this.props.isPremium
			? i18n.translate( 'Get in touch with the theme author' )
			: i18n.translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href={ this.props.forumUrl }
					onClick={ this.trackThemeForumClick }
				>
					{ i18n.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	};

	renderSupportCssCard = buttonCount => {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="briefcase" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Need CSS help? ' ) }
					<small>{ i18n.translate( 'Get help from the experts in our CSS forum' ) }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href="//en.forums.wordpress.com/forum/css-customization"
					onClick={ this.trackCssClick }
				>
					{ i18n.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	};

	renderSupportTab = () => {
		const { isCurrentUserPaid, isJetpack, forumUrl, isWpcomTheme, isLoggedIn } = this.props;
		let buttonCount = 1;
		let renderedTab = null;

		if ( isLoggedIn ) {
			renderedTab = (
				<div>
					{ isCurrentUserPaid && ! isJetpack && this.renderSupportContactUsCard( buttonCount++ ) }
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
							{ i18n.translate( 'This theme is unsupported' ) }
							<small>
								{ i18n.translate( "Maybe it's a custom theme? Sorry about that.", {
									context: 'Support message when we no support links are available',
								} ) }
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
						{ i18n.translate( 'Have a question about this theme?' ) }
						<small>
							{ i18n.translate( 'Pick this design and start a site with us, we can help!', {
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
		const { defaultOption, isActive, isLoggedIn, isPremium, isPurchased } = this.props;
		if ( isActive ) {
			// Customize site
			return (
				<span className="theme__sheet-customize-button">
					<Gridicon icon="external" />
					{ i18n.translate( 'Customize site' ) }
				</span>
			);
		} else if ( isLoggedIn ) {
			if ( isPremium && ! isPurchased ) {
				// purchase
				return i18n.translate( 'Pick this design' );
			} // else: activate
			return i18n.translate( 'Activate this design' );
		}
		return defaultOption.label;
	};

	renderRetired = () => {
		return (
			<div className="theme__sheet-content">
				<Card className="theme__retired-theme-message">
					<Gridicon icon="cross-circle" size={ 48 } />
					<div className="theme__retired-theme-message-details">
						<div className="theme__retired-theme-message-details-title">
							{ i18n.translate( 'This theme is retired' ) }
						</div>
						<div>
							{ i18n.translate(
								'We invite you to try out a newer theme; start by browsing our WordPress theme directory.'
							) }
						</div>
					</div>
					<Button primary={ true } href={ '/themes/' }>
						{ i18n.translate( 'See All Themes' ) }
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
			price = i18n.translate( 'Free' );
		}

		const className = classNames( 'theme__sheet-action-bar-cost', {
			'theme__sheet-action-bar-cost-upgrade': ! /\d/g.test( this.props.price ),
		} );

		return price ? <span className={ className }>{ price }</span> : '';
	};

	renderButton = () => {
		const { getUrl } = this.props.defaultOption;
		const label = this.getDefaultOptionLabel();
		const placeholder = <span className="theme__sheet-button-placeholder">loading......</span>;
		const { isActive } = this.props;

		return (
			<Button
				className="theme__sheet-primary-button"
				href={ getUrl ? getUrl( this.props.id ) : null }
				onClick={ this.onButtonClick }
				primary={ isActive }
				target={ isActive ? '_blank' : null }
			>
				{ this.isLoaded() ? label : placeholder }
				{ this.props.isWpcomTheme && this.renderPrice() }
			</Button>
		);
	};

	goBack = () => {
		const { previousRoute, backPath } = this.props;
		if ( previousRoute ) {
			page.back( previousRoute );
		} else {
			page( backPath );
		}
	};

	renderSheet = () => {
		const section = this.validateSection( this.props.section );
		const {
			id,
			siteId,
			siteSlug,
			retired,
			isPremium,
			isJetpack,
			isVip,
			translate,
			hasUnlimitedPremiumThemes,
			previousRoute,
		} = this.props;

		const analyticsPath = `/theme/${ id }${ section ? '/' + section : '' }${
			siteId ? '/:site' : ''
		}`;
		const analyticsPageTitle = `Themes > Details Sheet${
			section ? ' > ' + titlecase( section ) : ''
		}${ siteId ? ' > Site' : '' }`;

		const plansUrl = siteSlug ? `/plans/${ siteSlug }/?plan=value_bundle` : '/plans';

		const { canonicalUrl, currentUserId, description, name: themeName } = this.props;
		const title =
			themeName &&
			i18n.translate( '%(themeName)s Theme', {
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

		let pageUpsellBanner, previewUpsellBanner;
		const hasUpsellBanner =
			! isJetpack && isPremium && ! hasUnlimitedPremiumThemes && ! isVip && ! retired;
		if ( hasUpsellBanner ) {
			pageUpsellBanner = (
				<Banner
					plan={ PLAN_PREMIUM }
					className="theme__page-upsell-banner"
					title={ translate( 'Access this theme for FREE with a Premium or Business plan!' ) }
					description={ preventWidows(
						translate(
							'Instantly unlock all premium themes, more storage space, advanced customization, video support, and more when you upgrade.'
						)
					) }
					event="themes_plan_particular_free_with_plan"
					forceHref={ true }
					href={ plansUrl }
				/>
			);
			previewUpsellBanner = React.cloneElement( pageUpsellBanner, {
				className: 'theme__preview-upsell-banner',
			} );
		}
		const className = classNames( 'theme__sheet', { 'is-with-upsell-banner': hasUpsellBanner } );

		const links = [ { rel: 'canonical', href: canonicalUrl } ];

		return (
			<Main className={ className }>
				<QueryCanonicalTheme themeId={ this.props.id } siteId={ siteId } />
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				{ siteId && (
					<QuerySitePurchases siteId={ siteId } />
				) /* TODO: Make QuerySitePurchases handle falsey siteId */ }
				<QuerySitePlans siteId={ siteId } />
				<DocumentHead title={ title } meta={ metas } link={ links } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
				{ this.renderBar() }
				<QueryActiveTheme siteId={ siteId } />
				<ThanksModal source={ 'details' } />
				<AutoLoadingHomepageModal source={ 'details' } />
				{ pageUpsellBanner }
				<HeaderCake
					className="theme__sheet-action-bar"
					backText={ previousRoute ? i18n.translate( 'Back' ) : i18n.translate( 'All Themes' ) }
					onClick={ this.goBack }
				>
					{ ! retired && this.renderButton() }
				</HeaderCake>
				<div className="theme__sheet-columns">
					<div className="theme__sheet-column-left">
						{ ! retired && this.renderSectionContent( section ) }
						{ retired && this.renderRetired() }
					</div>
					<div className="theme__sheet-column-right">{ this.renderScreenshot() }</div>
				</div>
				<ThemePreview belowToolbar={ previewUpsellBanner } />
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

const ConnectedThemeSheet = connectOptions( props => {
	if ( ! props.isLoggedIn || props.siteId ) {
		return <ThemeSheet { ...props } />;
	}

	return (
		<ThemesSiteSelectorModal { ...props }>
			<ThemeSheet />
		</ThemesSiteSelectorModal>
	);
} );

const ThemeSheetWithOptions = props => {
	const { siteId, isActive, isLoggedIn, isPremium, isPurchased, isJetpack } = props;

	let defaultOption;
	let secondaryOption = 'tryandcustomize';
	const needsJetpackPlanUpgrade = isJetpack && isPremium && ! isPurchased;

	if ( needsJetpackPlanUpgrade ) {
		secondaryOption = '';
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
		const currentUserId = getCurrentUserId( state );
		const isCurrentUserPaid = isUserPaid( state, currentUserId );
		const theme = getCanonicalTheme( state, siteId, id );
		const siteIdOrWpcom = siteId || 'wpcom';
		const error = theme ? false : getThemeRequestErrors( state, id, siteIdOrWpcom );

		return {
			...theme,
			id,
			price: getPremiumThemePrice( state, id, siteId ),
			error,
			siteId,
			siteSlug,
			backPath,
			currentUserId,
			isCurrentUserPaid,
			isWpcomTheme,
			isLoggedIn: !! currentUserId,
			isActive: isThemeActive( state, id, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			isVip: isVipSite( state, siteId ),
			isPremium: isThemePremium( state, id ),
			isPurchased: isPremiumThemeAvailable( state, id, siteId ),
			forumUrl: getThemeForumUrl( state, id, siteId ),
			hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
			// No siteId specified since we want the *canonical* URL :-)
			canonicalUrl: 'https://wordpress.com' + getThemeDetailsUrl( state, id ),
			previousRoute: getPreviousRoute( state ),
		};
	},
	{
		setThemePreviewOptions,
		recordTracksEvent,
	}
)( localize( ThemeSheetWithOptions ) );
