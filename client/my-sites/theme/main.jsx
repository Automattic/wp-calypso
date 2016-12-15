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

/**
 * Internal dependencies
 */
import QueryTheme from 'components/data/query-theme';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import ThemeDownloadCard from './theme-download-card';
import ThemesRelatedCard from './themes-related-card';
import Button from 'components/button';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
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
	isThemePurchased,
	getThemeRequestErrors,
	getThemeForumUrl
} from 'state/themes/selectors';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import EmptyContentComponent from 'components/empty-content';
import ThemePreview from 'my-sites/themes/theme-preview';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities } from 'lib/formatting';
import { getTheme } from 'state/themes/selectors';
import { isValidTerm } from 'my-sites/themes/theme-filters';
import { hasFeature } from 'state/sites/plans/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

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
		// The defaultOption default prop is surprisingly important, see the long
		// comment near the connect() function at the bottom of this file.
		return {
			section: '',
			defaultOption: {}
		};
	},

	getInitialState() {
		return {
			showPreview: false,
		};
	},

	componentDidMount() {
		window.scroll( 0, 0 );
	},

	isLoaded() {
		// We need to make sure the theme object has been loaded including full details
		// (and not just without, as would've been stored by the `<QueryThemes />` (plural!)
		// component used by the theme showcase's list view). However, these extra details
		// aren't present for a Jetpack site.
		if ( this.props.isJetpack ) {
			return !! this.props.name;
		}
		return !! this.props.screenshots;
	},

	onButtonClick() {
		const { defaultOption } = this.props;
		defaultOption.action && defaultOption.action( this.props );
	},

	onSecondaryButtonClick() {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props );
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

	togglePreview() {
		this.setState( { showPreview: ! this.state.showPreview } );
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

	renderPreviewButton() {
		return (
			<a className="theme__sheet-preview-link" onClick={ this.togglePreview } data-tip-target="theme-sheet-preview">
				<Gridicon icon="themes" size={ 18 } />
				<span className="theme__sheet-preview-link-text">
					{ i18n.translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	},

	renderScreenshot() {
		let screenshot;
		if ( this.props.isJetpack ) {
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
				{ ! this.props.isJetpack && this.renderRelatedThemes() }
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

	renderContactUsCard( isPrimary = false ) {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Need extra help?' ) }
					<small>{ i18n.translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button primary={ isPrimary } href={ '/help/contact/' }>Contact us</Button>
			</Card>
		);
	},

	renderThemeForumCard( isPrimary = false ) {
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
				<Button primary={ isPrimary } href={ this.props.forumUrl }>Visit forum</Button>
			</Card>
		);
	},

	renderCssSupportCard() {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="briefcase" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Need CSS help? ' ) }
					<small>{ i18n.translate( 'Get help from the experts in our CSS forum' ) }</small>
				</div>
				<Button href="//en.forums.wordpress.com/forum/css-customization">Visit forum</Button>
			</Card>
		);
	},

	renderSupportTab() {
		if ( this.props.isCurrentUserPaid ) {
			return (
				<div>
					{ this.renderContactUsCard( true ) }
					{ this.renderThemeForumCard() }
					{ this.renderCssSupportCard() }
				</div>
			);
		}

		return (
			<div>
				{ this.renderThemeForumCard( true ) }
				{ this.renderCssSupportCard() }
			</div>
		);
	},

	renderFeaturesCard() {
		const { isJetpack, siteSlug, taxonomies } = this.props;
		if ( ! taxonomies || ! isArray( taxonomies.theme_feature ) ) {
			return null;
		}

		const themeFeatures = taxonomies.theme_feature.map( function( item ) {
			const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
			return (
				<li key={ 'theme-features-item-' + item.slug }>
					{ isJetpack
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
		// * If it's on a Jetpack site, and the theme object doesn't have a 'download' attr
		//   Note that not having a 'download' attr would be permissible for a theme on WPCOM
		//   since we don't provide any for some themes found on WordPress.org (notably the 'Twenties').
		//   The <ThemeDownloadCard /> component can handle that case.
		if ( this.props.isPremium || ( this.props.isJetpack && ! this.props.download ) ) {
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

	renderPreview() {
		const { isActive, isLoggedIn, defaultOption, secondaryOption } = this.props;

		const showSecondaryButton = secondaryOption && ! isActive && isLoggedIn;
		return (
			<ThemePreview showPreview={ this.state.showPreview }
				theme={ this.props }
				onClose={ this.togglePreview }
				primaryButtonLabel={ this.getDefaultOptionLabel() }
				getPrimaryButtonHref={ defaultOption.getUrl }
				onPrimaryButtonClick={ this.onButtonClick }
				secondaryButtonLabel={ showSecondaryButton ? secondaryOption.label : null }
				onSecondaryButtonClick={ this.onSecondaryButtonClick }
				getSecondaryButtonHref={ showSecondaryButton ? secondaryOption.getUrl : null }
			/>
		);
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
				href={ getUrl ? getUrl( this.props ) : null }
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

		const { name: themeName, description, currentUserId, isJetpack, siteIdOrWpcom } = this.props;
		const title = themeName && i18n.translate( '%(themeName)s Theme', {
			args: { themeName }
		} );
		const canonicalUrl = `https://wordpress.com/theme/${ this.props.id }`; // TODO: use getDetailsUrl() When it becomes availavle

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
				<QueryTheme themeId={ this.props.id } siteId={ siteIdOrWpcom } />
				{ isJetpack && <QueryTheme themeId={ this.props.id } siteId="wporg" /> }
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
				{ this.state.showPreview && this.renderPreview() }
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
	const { selectedSite: site, isActive, isLoggedIn, isPremium, isPurchased } = props;
	const siteId = site ? site.ID : null;

	let defaultOption;

	if ( ! isLoggedIn ) {
		defaultOption = 'signup';
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
				'activate'
			] }
			defaultOption={ defaultOption }
			secondaryOption="tryandcustomize"
			source="showcase-sheet" />
	);
};

export default connect(
	/*
	 * A number of the props that this mapStateToProps function computes are used
	 * by ThemeSheetWithOptions to compute defaultOption. After a state change
	 * triggered by an async action, connect()ed child components are, quite
	 * counter-intuitively, updated before their connect()ed parents (this is
	 * https://github.com/reactjs/redux/issues/1415), and might be fixed by
	 * react-redux 5.0.
	 * For this reason, after e.g. activating a theme in single-site mode,
	 * first the ThemeSheetWithOptions component's (child) connectOptions component
	 * will update in response to the currently displayed theme being activated.
	 * Doing so, it will filter and remove the activate option (adding customize
	 * instead). However, since the parent connect()ed-ThemeSheetWithOptions will
	 * only react to the state change afterwards, there is a brief moment when
	 * connectOptions still receives "activate" as its defaultOption prop, when
	 * activate is no longer part of its filtered options set, hence passing on
	 * undefined as the defaultOption object prop for its child. For the theme
	 * sheet, which eventually gets that defaultOption object prop, this means
	 * we must be careful to not accidentally access any attribute of that
	 * defaultOption prop. Otherwise, there will be an error that will prevent the
	 * state update from finishing properly, hence not updating defaultOption at all.
	 * The solution to this incredibly intricate issue is simple: Give ThemeSheet
	 * a valid defaultProp for defaultOption.
	 */
	( state, { id } ) => {
		const selectedSite = getSelectedSite( state );
		const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
		const isJetpack = selectedSite && isJetpackSite( state, selectedSite.ID );
		const siteIdOrWpcom = isJetpack ? selectedSite.ID : 'wpcom';
		const backPath = getBackPath( state );
		const currentUserId = getCurrentUserId( state );
		const isCurrentUserPaid = isUserPaid( state, currentUserId );
		const theme = getTheme( state, siteIdOrWpcom, id );
		const error = theme ? false : getThemeRequestErrors( state, id, siteIdOrWpcom );

		return {
			...theme,
			id,
			error,
			selectedSite,
			siteSlug,
			isJetpack,
			siteIdOrWpcom,
			backPath,
			currentUserId,
			isCurrentUserPaid,
			isLoggedIn: !! currentUserId,
			isActive: selectedSite && isThemeActive( state, id, selectedSite.ID ),
			isPremium: isThemePremium( state, id ),
			isPurchased: selectedSite && (
				isThemePurchased( state, id, selectedSite.ID ) ||
				hasFeature( state, selectedSite.ID, FEATURE_UNLIMITED_PREMIUM_THEMES )
			),
			forumUrl: selectedSite && getThemeForumUrl( state, id, selectedSite.ID )
		};
	}
)( ThemeSheetWithOptions );
