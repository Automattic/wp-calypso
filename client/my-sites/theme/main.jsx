/* eslint-disable react/no-danger  */
// FIXME!!!^ we want to ensure we have sanitised data…

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import titlecase from 'to-title-case';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import ThemeDownloadCard from './theme-download-card';
import ThemesRelatedCard from './themes-related-card';
import ThemePreview from 'my-sites/themes/theme-preview';
import Button from 'components/button';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isUserPaid } from 'state/purchases/selectors';
import ThanksModal from 'my-sites/themes/thanks-modal';
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
	getThemeDetailsUrl,
	getThemeRequestErrors,
	getThemeForumUrl,
} from 'state/themes/selectors';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities } from 'lib/formatting';
import { getCanonicalTheme } from 'state/themes/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { setThemePreviewOptions } from 'state/themes/actions';
import ThemeNotFoundError from './theme-not-found-error';
import ThemeFeaturesCard from './theme-features-card';
import config from 'config';

const ThemeSheet = React.createClass( {
	displayName: 'ThemeSheet',

	propTypes: {
		id: React.PropTypes.string,
		name: React.PropTypes.string,
		author: React.PropTypes.string,
		screenshot: React.PropTypes.string,
		screenshots: React.PropTypes.array,
		price: React.PropTypes.string,
		description: React.PropTypes.string,
		descriptionLong: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.bool // happens if no content: false
		] ),
		supportDocumentation: React.PropTypes.string,
		download: React.PropTypes.string,
		taxonomies: React.PropTypes.object,
		stylesheet: React.PropTypes.string,
		retired: React.PropTypes.bool,
		// Connected props
		isLoggedIn: React.PropTypes.bool,
		isActive: React.PropTypes.bool,
		isPurchased: React.PropTypes.bool,
		isJetpack: React.PropTypes.bool,
		siteId: React.PropTypes.number,
		siteSlug: React.PropTypes.string,
		backPath: React.PropTypes.string,
		isWpcomTheme: React.PropTypes.bool,
		defaultOption: React.PropTypes.shape( {
			label: React.PropTypes.string,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
		secondaryOption: React.PropTypes.shape( {
			label: React.PropTypes.string,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
	},

	getDefaultProps() {
		return {
			section: ''
		};
	},

	scrollToTop() {
		window.scroll( 0, 0 );
	},

	componentDidMount() {
		this.scrollToTop();
	},

	componentWillUpdate( nextProps ) {
		if ( nextProps.id !== this.props.id ) {
			this.scrollToTop();
		}
	},

	isLoaded() {
		// We need to make sure the theme object has been loaded including full details
		// (and not just without, as would've been stored by the `<QueryThemes />` (plural!)
		// component used by the theme showcase's list view). However, these extra details
		// aren't present for non-wpcom themes.
		if ( ! this.props.isWpcomTheme ) {
			return !! this.props.name;
		}
		return !! this.props.screenshots;
	},

	onButtonClick() {
		const { defaultOption } = this.props;
		defaultOption.action && defaultOption.action( this.props.id );
	},

	onSecondaryButtonClick() {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props.id );
	},

	getValidSections() {
		const validSections = [];
		validSections.push( '' ); // Default section
		this.props.supportDocumentation && validSections.push( 'setup' );
		validSections.push( 'support' );
		return validSections;
	},

	validateSection( section ) {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[ 0 ];
		}
		return section;
	},

	trackButtonClick( context ) {
		this.props.recordTracksEvent( 'calypso_theme_sheet_button_click', {
			theme_name: this.props.id,
			button_context: context
		} );
	},

	trackContactUsClick() {
		this.trackButtonClick( 'help' );
	},

	trackThemeForumClick() {
		this.trackButtonClick( 'theme_forum' );
	},

	trackCssClick() {
		this.trackButtonClick( 'css_forum' );
	},

	renderBar() {
		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = this.props.name || placeholder;
		const tag = this.props.author ? i18n.translate( 'by %(author)s', { args: { author: this.props.author } } ) : placeholder;

		return (
			<div className="theme__sheet-bar">
				<span className="theme__sheet-bar-title">{ title }</span>
				<span className="theme__sheet-bar-tag">{ tag }</span>
			</div>
		);
	},

	getFullLengthScreenshot() {
		if ( this.isLoaded() ) {
			return this.props.screenshots[ 0 ];
		}
		return null;
	},

	previewAction() {
		const { preview } = this.props.options;
		this.props.setThemePreviewOptions( this.props.defaultOption, this.props.secondaryOption );
		return preview.action( this.props.id );
	},

	renderPreviewButton() {
		return (
			<a className="theme__sheet-preview-link" onClick={ this.previewAction } data-tip-target="theme-sheet-preview">
				<span className="theme__sheet-preview-link-text">
					{ i18n.translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	},

	renderScreenshot() {
		const { demo_uri, retired, isWpcomTheme } = this.props;
		const screenshotFull = isWpcomTheme ? this.getFullLengthScreenshot() : this.props.screenshot;
		const img = screenshotFull && <img className="theme__sheet-img" src={ screenshotFull + '?w=680' } />;

		if ( demo_uri && ! retired ) {
			return (
				<div className="theme__sheet-screenshot is-active" onClick={ this.previewAction }>
					{ this.renderPreviewButton() }
					{ img }
				</div>
			);
		}

		return (
			<div className="theme__sheet-screenshot">
				{ img }
			</div>
		);
	},

	renderSectionNav( currentSection ) {
		const filterStrings = {
			'': i18n.translate( 'Overview', { context: 'Filter label for theme content' } ),
			setup: i18n.translate( 'Setup', { context: 'Filter label for theme content' } ),
			support: i18n.translate( 'Support', { context: 'Filter label for theme content' } ),
		};

		const { siteSlug, id } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nav = (
			<NavTabs label="Details" >
				{ this.getValidSections().map( ( section ) => (
					<NavItem key={ section }
						path={ `/theme/${ id }${ section ? '/' + section : '' }${ sitePart }` }
						selected={ section === currentSection }>
						{ filterStrings[ section ] }
					</NavItem>
				) ) }
			</NavTabs>
		);

		return (
			<SectionNav className="theme__sheet-section-nav" selectedText={ filterStrings[ currentSection ] }>
				{ this.isLoaded() && nav }
			</SectionNav>
		);
	},

	renderSectionContent( section ) {
		const activeSection = {
			'': this.renderOverviewTab(),
			setup: this.renderSetupTab(),
			support: this.renderSupportTab(),
		}[ section ];

		return (
			<div className="theme__sheet-content">
				{ this.renderSectionNav( section ) }
				{ activeSection }
				<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
			</div>
		);
	},

	renderDescription() {
		if ( this.props.descriptionLong ) {
			return (
				<div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />
			);
		}
		// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
		return <div>{ this.props.description }</div>;
	},

	renderNextTheme() {
		const { next, siteSlug } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nextThemeHref = `/theme/${ next }${ sitePart }`;
		return <SectionHeader
			href={ nextThemeHref }
			label={ i18n.translate( 'Next theme' ) } />;
	},

	renderOverviewTab() {
		const { download, isWpcomTheme, siteSlug, taxonomies, isPremium } = this.props;

		return (
			<div>
				<Card className="theme__sheet-content">
					{ this.renderDescription() }
				</Card>
				<ThemeFeaturesCard taxonomies={ taxonomies }
					siteSlug={ siteSlug }
					isWpcomTheme={ isWpcomTheme } />
				{ download && ! isPremium && <ThemeDownloadCard href={ download } /> }
				{ isWpcomTheme && this.renderRelatedThemes() }
				{ isWpcomTheme && this.renderNextTheme() }
			</div>
		);
	},

	renderSetupTab() {
		return (
			<div>
				<Card className="theme__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />
				</Card>
			</div>
		);
	},

	renderSupportContactUsCard( buttonCount ) {
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
					onClick={ this.trackContactUsClick }>
					{ i18n.translate( 'Contact us' ) }
				</Button>
			</Card>
		);
	},

	renderSupportThemeForumCard( buttonCount ) {
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
					onClick={ this.trackThemeForumClick }>
					{ i18n.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	},

	renderSupportCssCard( buttonCount ) {
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
					onClick={ this.trackCssClick }>
					{ i18n.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	},

	renderSupportTab() {
		const { isCurrentUserPaid, isJetpack, forumUrl, isWpcomTheme, isLoggedIn } = this.props;
		let buttonCount = 1;
		let renderedTab = null;

		if ( isLoggedIn ) {
			renderedTab = (
				<div>
					{ isCurrentUserPaid && ! isJetpack &&
						this.renderSupportContactUsCard( buttonCount++ ) }
					{ forumUrl &&
						this.renderSupportThemeForumCard( buttonCount++ ) }
					{ isWpcomTheme &&
						this.renderSupportCssCard( buttonCount++ ) }
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
								{ i18n.translate( 'Maybe it\'s a custom theme? Sorry about that.',
									{ context: 'Support message when we no support links are available' } )
								}
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
							{ i18n.translate( 'Pick this design and start a site with us, we can help!',
								{ context: 'Logged out theme support message' } )
							}
						</small>
					</div>
				</Card>
			);
		}

		return renderedTab;
	},

	getDefaultOptionLabel() {
		const { defaultOption, isActive, isLoggedIn, isPremium, isPurchased, isJetpack } = this.props;
		if ( isLoggedIn && ! isActive ) {
			if ( isPremium && ! isPurchased ) { // purchase
				return config.isEnabled( 'jetpack/pijp' ) && isJetpack
					? i18n.translate( 'Upgrade to activate', {
						comment: 'label prompting user to upgrade the Jetpack plan to activate a certain theme'
					} )
					: i18n.translate( 'Pick this design' );
			} // else: activate
			return i18n.translate( 'Activate this design' );
		}
		return defaultOption.label;
	},

	renderRelatedThemes() {
		return <ThemesRelatedCard currentTheme={ this.props.id } />;
	},

	renderRetired() {
		return (
			<div className="theme__sheet-content">
				<Card className="theme__retired-theme-message">
					<Gridicon icon="cross-circle" size={ 48 } />
					<div className="theme__retired-theme-message-details">
						<div className="theme__retired-theme-message-details-title">{ i18n.translate( 'This theme is retired' ) }</div>
						<div>
							{ i18n.translate( 'We invite you to try out a newer theme; start by browsing our WordPress theme directory.' ) }
						</div>
					</div>
					<Button
						primary={ true }
						href={ '/themes/' }>
						{ i18n.translate( 'See All Themes' ) }
					</Button>
				</Card>

				<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
			</div>
		);
	},

	renderPrice() {
		if ( config.isEnabled( 'jetpack/pijp' ) && this.props.isJetpack ) {
			return '';
		}
		let price = this.props.price;
		if ( ! this.isLoaded() || this.props.isActive || this.props.isPurchased ) {
			price = '';
		} else if ( ! this.props.isPremium ) {
			price = i18n.translate( 'Free' );
		}

		return price ? <span className="theme__sheet-action-bar-cost">{ price }</span> : '';
	},

	renderButton() {
		const { getUrl } = this.props.defaultOption;
		const label = this.getDefaultOptionLabel();
		const placeholder = <span className="theme__sheet-button-placeholder">loading......</span>;

		return (
			<Button className="theme__sheet-primary-button"
				href={ getUrl ? getUrl( this.props.id ) : null }
				onClick={ this.onButtonClick }>
				{ this.isLoaded() ? label : placeholder }
				{ this.props.isWpcomTheme && this.renderPrice() }
			</Button>
		);
	},

	renderSheet() {
		const section = this.validateSection( this.props.section );
		const { siteId, retired } = this.props;

		const analyticsPath = `/theme/:slug${ section ? '/' + section : '' }${ siteId ? '/:site_id' : '' }`;
		const analyticsPageTitle = `Themes > Details Sheet${ section ? ' > ' + titlecase( section ) : '' }${ siteId ? ' > Site' : '' }`;

		const { canonicalUrl, currentUserId, description, name: themeName } = this.props;
		const title = themeName && i18n.translate( '%(themeName)s Theme', {
			args: { themeName }
		} );

		const metas = [
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: this.props.screenshot },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' }
		];

		if ( description ) {
			metas.push( {
				name: 'description',
				property: 'og:description',
				content: decodeEntities( description )
			} );
		}

		const links = [ { rel: 'canonical', href: canonicalUrl } ];

		return (
			<Main className="theme__sheet">
				<QueryCanonicalTheme themeId={ this.props.id } siteId={ siteId } />
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> /* TODO: Make QuerySitePurchases handle falsey siteId */ }
				<QuerySitePlans siteId={ siteId } />
				<DocumentHead
					title={ title }
					meta={ metas }
					link={ links } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
				{ this.renderBar() }
				<QueryActiveTheme siteId={ siteId } />
				<ThanksModal source={ 'details' } />
				<HeaderCake className="theme__sheet-action-bar"
					backHref={ this.props.backPath }
					backText={ i18n.translate( 'All Themes' ) }>
					{ ! retired && this.renderButton() }
				</HeaderCake>
				<div className="theme__sheet-columns">
					<div className="theme__sheet-column-left">
						{ ! retired && this.renderSectionContent( section ) }
						{ retired && this.renderRetired() }
					</div>
					<div className="theme__sheet-column-right">
						{ this.renderScreenshot() }
					</div>
				</div>
				<ThemePreview />
			</Main>
		);
	},

	render() {
		if ( this.props.error ) {
			return <ThemeNotFoundError />;
		}
		return this.renderSheet();
	},
} );

const ConnectedThemeSheet = connectOptions(
	( props ) => {
		if ( ! props.isLoggedIn || props.siteId ) {
			return <ThemeSheet { ...props } />;
		}

		return (
			<ThemesSiteSelectorModal { ...props }>
				<ThemeSheet />
			</ThemesSiteSelectorModal>
		);
	}
);

const ThemeSheetWithOptions = ( props ) => {
	const {
		siteId,
		isActive,
		isLoggedIn,
		isPremium,
		isPurchased,
	} = props;

	let defaultOption;
	let secondaryOption = 'tryandcustomize';

	if ( ! isLoggedIn ) {
		defaultOption = 'signup';
		secondaryOption = null;
	} else if ( isActive ) {
		defaultOption = 'customize';
	} else if ( isPremium && ! isPurchased ) {
		defaultOption = 'purchase';
	} else {
		defaultOption = 'activate';
	}

	return (
		<ConnectedThemeSheet { ...props }
			siteId={ siteId }
			defaultOption={ defaultOption }
			secondaryOption={ secondaryOption }
			source="showcase-sheet" />
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
			isPremium: isThemePremium( state, id ),
			isPurchased: isPremiumThemeAvailable( state, id, siteId ),
			forumUrl: getThemeForumUrl( state, id, siteId ),
			// No siteId specified since we want the *canonical* URL :-)
			canonicalUrl: 'https://wordpress.com' + getThemeDetailsUrl( state, id )
		};
	},
	{
		setThemePreviewOptions,
		recordTracksEvent,
	}
)( ThemeSheetWithOptions );
