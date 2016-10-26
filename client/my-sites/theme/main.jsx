/** @ssr-ready **/

/* eslint-disable react/no-danger  */
// FIXME!!!^ we want to ensure we have sanitised data…

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import QueryThemeDetails from 'components/data/query-theme-details';
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
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isUserPaid } from 'state/purchases/selectors';
import { getForumUrl } from 'my-sites/themes/helpers';
import { isPremiumTheme as isPremium } from 'state/themes/utils';
import { isThemeActive } from 'state/themes/selectors';
import ThanksModal from 'my-sites/themes/thanks-modal';
import QueryCurrentTheme from 'components/data/query-current-theme';
import QueryUserPurchases from 'components/data/query-user-purchases';
import ThemesSiteSelectorModal from 'my-sites/themes/themes-site-selector-modal';
import ThemeOptions from 'my-sites/themes/theme-options';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import EmptyContentComponent from 'components/empty-content';
import ThemePreview from 'my-sites/themes/theme-preview';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities } from 'lib/formatting';
import { getThemeDetails } from 'state/themes/theme-details/selectors';
import { isValidTerm } from 'my-sites/themes/theme-filters';

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
		purchased: React.PropTypes.bool,
		// Connected props
		isActive: React.PropTypes.bool,
		isLoggedIn: React.PropTypes.bool,
		selectedSite: React.PropTypes.object,
		siteSlug: React.PropTypes.string,
		backPath: React.PropTypes.string,
		defaultOption: React.PropTypes.shape( {
			label: React.PropTypes.string.isRequired,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
		secondaryOption: React.PropTypes.shape( {
			label: React.PropTypes.string.isRequired,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
	},

	getDefaultProps() {
		return {
			section: '',
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
		return !! this.props.name;
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
		return '';
	},

	renderScreenshot() {
		const img = <img className="theme__sheet-img" src={ this.getFullLengthScreenshot() + '?=w680' } />;
		return (
			<div className="theme__sheet-screenshot">
				<a className="theme__sheet-preview-link" onClick={ this.togglePreview } data-tip-target="theme-sheet-preview">
					<Gridicon icon="themes" size={ 18 } />
					<span className="theme__sheet-preview-link-text">
						{ i18n.translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
					</span>
				</a>
				{ this.getFullLengthScreenshot() && img }
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

	renderOverviewTab() {
		return (
			<div>
				<Card className="theme__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />
				</Card>
				{ this.renderFeaturesCard() }
				{ this.renderDownload() }
				{ this.renderRelatedThemes() }
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
		const description = isPremium( this.props )
			? i18n.translate( 'Get in touch with the theme author' )
			: i18n.translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ i18n.translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button primary={ isPrimary } href={ getForumUrl( this.props ) }>Visit forum</Button>
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
		const { siteSlug, taxonomies } = this.props;
		const themeFeatures = taxonomies && taxonomies.theme_feature instanceof Array
		? taxonomies.theme_feature.map( function( item ) {
			const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
			return (
				<li key={ 'theme-features-item-' + item.slug }>
					<a href={ `/design/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
				</li>
			);
		} ) : [];

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
		if ( isPremium( this.props ) ) {
			return null;
		}
		return <ThemeDownloadCard theme={ this.props.id } href={ this.props.download } />;
	},

	renderPreview() {
		const { secondaryOption, isActive, isLoggedIn, defaultOption } = this.props;
		const showSecondaryButton = secondaryOption && ! isActive && isLoggedIn;
		return (
			<ThemePreview showPreview={ this.state.showPreview }
				theme={ this.props }
				onClose={ this.togglePreview }
				primaryButtonLabel={ defaultOption.label }
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
		if ( ! this.isLoaded() || this.props.isActive ) {
			price = '';
		} else if ( ! isPremium( this.props ) ) {
			price = i18n.translate( 'Free' );
		}

		return price ? <span className="theme__sheet-action-bar-cost">{ price }</span> : '';
	},

	renderButton() {
		const { label, getUrl } = this.props.defaultOption;
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

		const { name: themeName, description, currentUserId } = this.props;
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
				<QueryThemeDetails id={ this.props.id } siteId={ siteID } />
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				<DocumentHead
					title={ title }
					meta={ metas }
					link={ links } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
					{ this.renderBar() }
					{ siteID && <QueryCurrentTheme siteId={ siteID } /> }
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

const WrappedThemeSheet = ( props ) => {
	if ( ! props.isLoggedIn || props.selectedSite ) {
		return <ThemeSheet { ...props } />;
	}

	return (
		<ThemesSiteSelectorModal { ...props }
			sourcePath={ `/theme/${ props.id }${ props.section ? '/' + props.section : '' }` }>
			<ThemeSheet />
		</ThemesSiteSelectorModal>
	);
};

const ThemeSheetWithOptions = ( props ) => {
	const { selectedSite: site, isActive, price, isLoggedIn } = props;

	let defaultOption;

	if ( ! isLoggedIn ) {
		defaultOption = 'signup';
	} else if ( isActive ) {
		defaultOption = 'customize';
	} else if ( price ) {
		defaultOption = 'purchase';
		//defaultOption.label = i18n.translate( 'Pick this design' );
	} else {
		defaultOption = 'activate';
		//defaultOption.label = i18n.translate( 'Activate this design' );
	}

	return (
		<ThemeOptions site={ site }
			theme={ props /* TODO: Have ThemeOptions only use theme ID */ }
			options={ [
				'signup',
				'customize',
				'tryandcustomize',
				'purchase',
				'activate'
			] }
			defaultOption={ defaultOption }
			secondaryOption="tryandcustomize"
			source="showcase-sheet">
			<WrappedThemeSheet { ...props } />
		</ThemeOptions>
	);
};

export default connect(
	( state, props ) => {
		const selectedSite = getSelectedSite( state );
		const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
		const backPath = getBackPath( state );
		const currentUserId = getCurrentUserId( state );
		const isCurrentUserPaid = isUserPaid( state, currentUserId );
		const themeDetails = getThemeDetails( state, props.id );
		const isActive = selectedSite && isThemeActive( state, props.id, selectedSite.ID );

		return {
			...themeDetails,
			id: props.id,
			isActive,
			selectedSite,
			siteSlug,
			backPath,
			currentUserId,
			isCurrentUserPaid,
			isLoggedIn: !! currentUserId,
		};
	}
)( ThemeSheetWithOptions );
