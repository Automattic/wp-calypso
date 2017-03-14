/* eslint-disable react/no-danger  */
// FIXME!!!^ we want to ensure we have sanitised data…

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import titlecase from 'to-title-case';
import { isArray } from 'lodash';
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
import { getSelectedSite } from 'state/ui/selectors';
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
import EmptyContentComponent from 'components/empty-content';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities } from 'lib/formatting';
import { getCanonicalTheme } from 'state/themes/selectors';
import { isValidTerm } from 'my-sites/themes/theme-filters';
import { recordTracksEvent } from 'state/analytics/actions';
import { setThemePreviewOptions } from 'state/themes/actions';

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
		descriptionLong: React.PropTypes.string,
		supportDocumentation: React.PropTypes.string,
		download: React.PropTypes.string,
		taxonomies: React.PropTypes.object,
		stylesheet: React.PropTypes.string,
		// Connected props
		isLoggedIn: React.PropTypes.bool,
		isActive: React.PropTypes.bool,
		isPurchased: React.PropTypes.bool,
		selectedSite: React.PropTypes.object,
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

	componentDidMount() {
		window.scroll( 0, 0 );
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
				<Gridicon icon="themes" size={ 18 } />
				<span className="theme__sheet-preview-link-text">
					{ i18n.translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	},

	renderScreenshot() {
		let screenshot;
		if ( ! this.props.isWpcomTheme ) {
			screenshot = this.props.screenshot;
		} else {
			screenshot = this.getFullLengthScreenshot();
		}
		const img = screenshot && <img className="theme__sheet-img" src={ screenshot + '?=w680' } />;
		return (
			<div className="theme__sheet-screenshot">
				{ this.props.demo_uri && this.renderPreviewButton() }
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
		return {
			'': this.renderOverviewTab(),
			setup: this.renderSetupTab(),
			support: this.renderSupportTab(),
		}[ section ];
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

	renderOverviewTab() {
		return (
			<div>
				<Card className="theme__sheet-content">
					{ this.renderDescription() }
				</Card>
				{ this.renderFeaturesCard() }
				{ this.renderDownload() }
				{ this.props.isWpcomTheme && this.renderRelatedThemes() }
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

	renderFeaturesCard() {
		const { isWpcomTheme, siteSlug, taxonomies } = this.props;
		if ( ! taxonomies || ! isArray( taxonomies.theme_feature ) ) {
			return null;
		}

		const themeFeatures = taxonomies.theme_feature.map( function( item ) {
			const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
			return (
				<li key={ 'theme-features-item-' + item.slug }>
					{ ! isWpcomTheme
						? <a>{ item.name }</a>
						: <a href={ `/design/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
					}
				</li>
			);
		} );

		return (
			<div>
				<SectionHeader label={ i18n.translate( 'Features' ) } />
				<Card>
					<ul className="theme__sheet-features-list">
						{ themeFeatures }
					</ul>
				</Card>
			</div>
		);
	},

	renderDownload() {
		// Don't render download button:
		// * If it's a premium theme
		// * If it's a non-wpcom theme, and the theme object doesn't have a 'download' attr
		//   Note that not having a 'download' attr would be permissible for a theme on WPCOM
		//   since we don't provide any for some themes found on WordPress.org (notably the 'Twenties').
		//   The <ThemeDownloadCard /> component can handle that case.
		if ( this.props.isPremium || ( ! this.props.isWpcomTheme && ! this.props.download ) ) {
			return null;
		}
		return <ThemeDownloadCard theme={ this.props.id } href={ this.props.download } />;
	},

	getDefaultOptionLabel() {
		const { defaultOption, isActive, isLoggedIn, isPremium, isPurchased } = this.props;
		if ( isLoggedIn && ! isActive ) {
			if ( isPremium && ! isPurchased ) { // purchase
				return i18n.translate( 'Pick this design' );
			} // else: activate
			return i18n.translate( 'Activate this design' );
		}
		return defaultOption.label;
	},

	renderError() {
		const emptyContentTitle = i18n.translate( 'Looking for great WordPress designs?', {
			comment: 'Message displayed when requested theme was not found',
		} );
		const emptyContentMessage = i18n.translate( 'Check our theme showcase', {
			comment: 'Message displayed when requested theme was not found',
		} );

		return (
			<Main>
				<EmptyContentComponent
					title={ emptyContentTitle }
					line={ emptyContentMessage }
					action={ i18n.translate( 'View the showcase' ) }
					actionURL="/design"
				/>
			</Main>
		);
	},

	renderRelatedThemes() {
		return <ThemesRelatedCard currentTheme={ this.props.id } />;
	},

	renderPrice() {
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
				{ this.renderPrice() }
			</Button>
		);
	},

	renderSheet() {
		const section = this.validateSection( this.props.section );
		const siteID = this.props.selectedSite && this.props.selectedSite.ID;

		const analyticsPath = `/theme/:slug${ section ? '/' + section : '' }${ siteID ? '/:site_id' : '' }`;
		const analyticsPageTitle = `Themes > Details Sheet${ section ? ' > ' + titlecase( section ) : '' }${ siteID ? ' > Site' : '' }`;

		const { canonicalUrl, currentUserId, description, name: themeName } = this.props;
		const title = themeName && i18n.translate( '%(themeName)s Theme', {
			args: { themeName }
		} );

		const metas = [
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: this.props.screenshot },
			{ property: 'og:type', content: 'website' }
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
				<QueryCanonicalTheme themeId={ this.props.id } siteId={ siteID } />
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				{ siteID && <QuerySitePurchases siteId={ siteID } /> }
				{ siteID && <QuerySitePlans siteId={ siteID } /> }
				<DocumentHead
					title={ title }
					meta={ metas }
					link={ links } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
				{ this.renderBar() }
				{ siteID && <QueryActiveTheme siteId={ siteID } /> }
				<ThanksModal
					site={ this.props.selectedSite }
					source={ 'details' } />
				<HeaderCake className="theme__sheet-action-bar"
					backHref={ this.props.backPath }
					backText={ i18n.translate( 'All Themes' ) }>
					{ this.renderButton() }
				</HeaderCake>
				<div className="theme__sheet-columns">
					<div className="theme__sheet-column-left">
						<div className="theme__sheet-content">
							{ this.renderSectionNav( section ) }
							{ this.renderSectionContent( section ) }
							<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
						</div>
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
			return this.renderError();
		}
		return this.renderSheet();
	},
} );

const ConnectedThemeSheet = connectOptions(
	( props ) => {
		if ( ! props.isLoggedIn || props.selectedSite ) {
			return <ThemeSheet { ...props } />;
		}

		return (
			<ThemesSiteSelectorModal { ...props }
				sourcePath={ `/theme/${ props.id }${ props.section ? '/' + props.section : '' }` }>
				<ThemeSheet />
			</ThemesSiteSelectorModal>
		);
	}
);

const ThemeSheetWithOptions = ( props ) => {
	const {
		selectedSite: site,
		isActive,
		isLoggedIn,
		isPremium,
		isPurchased,
	} = props;
	const siteId = site ? site.ID : null;

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
			theme={ props /* TODO: Have connectOptions() only use theme ID */ }
			options={ [
				'signup',
				'customize',
				'tryandcustomize',
				'purchase',
				'activate',
				'preview'
			] }
			defaultOption={ defaultOption }
			secondaryOption={ secondaryOption }
			source="showcase-sheet" />
	);
};

export default connect(
	( state, { id } ) => {
		const selectedSite = getSelectedSite( state );
		const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
		const isWpcomTheme = isThemeWpcom( state, id );
		const backPath = getBackPath( state );
		const currentUserId = getCurrentUserId( state );
		const isCurrentUserPaid = isUserPaid( state, currentUserId );
		const theme = getCanonicalTheme( state, selectedSite && selectedSite.ID, id );
		const siteIdOrWpcom = selectedSite ? selectedSite.ID : 'wpcom';
		const error = theme ? false : getThemeRequestErrors( state, id, siteIdOrWpcom );

		return {
			...theme,
			id,
			error,
			selectedSite,
			siteSlug,
			backPath,
			currentUserId,
			isCurrentUserPaid,
			isWpcomTheme,
			isLoggedIn: !! currentUserId,
			isActive: selectedSite && isThemeActive( state, id, selectedSite.ID ),
			isJetpack: selectedSite && isJetpackSite( state, selectedSite.ID ),
			isPremium: isThemePremium( state, id ),
			isPurchased: selectedSite && isPremiumThemeAvailable( state, id, selectedSite.ID ),
			forumUrl: getThemeForumUrl( state, id, selectedSite && selectedSite.ID ),
			canonicalUrl: 'https://wordpress.com' + getThemeDetailsUrl( state, id ) // No siteId specified since we want the *canonical* URL :-)
		};
	},
	{
		setThemePreviewOptions,
		recordTracksEvent,
	}
)( ThemeSheetWithOptions );
