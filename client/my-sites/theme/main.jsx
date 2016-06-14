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
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import ThemeDownloadCard from './theme-download-card';
import ThemesRelatedCard from './themes-related-card';
import ThemePickButton from './theme-pick-button';
import Button from 'components/button';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { getSelectedSite } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isPremium, getForumUrl } from 'my-sites/themes/helpers';
import ThanksModal from 'my-sites/themes/thanks-modal';
import QueryCurrentTheme from 'components/data/query-current-theme';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import EmptyContentComponent from 'components/empty-content';
import ThemePreview from 'my-sites/themes/theme-preview';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const ThemeSheet = React.createClass( {
	displayName: 'ThemeSheet',

	propTypes: {
		id: React.PropTypes.string,
		name: React.PropTypes.string,
		author: React.PropTypes.string,
		screenshot: React.PropTypes.string,
		price: React.PropTypes.string,
		description: React.PropTypes.string,
		descriptionLong: React.PropTypes.string,
		supportDocumentation: React.PropTypes.string,
		download: React.PropTypes.string,
		taxonomies: React.PropTypes.object,
		stylesheet: React.PropTypes.string,
		active: React.PropTypes.bool,
		purchased: React.PropTypes.bool,
		// Connected props
		selectedSite: React.PropTypes.object,
		siteSlug: React.PropTypes.string,
		backPath: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			section: '',
		};
	},

	componentDidMount() {
		window.scroll( 0, 0 );
	},

	getTheme() {
		return pick( this.props, [ 'id', 'name', 'author', 'screenshot', 'price', 'description', 'descriptionLong', 'supportDocumentation', 'download', 'taxonomies', 'stylesheet', 'active', 'purchased' ] );
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
		const placeholder = <span className="themes__sheet-placeholder">loading.....</span>;
		const title = this.props.name || placeholder;
		const tag = this.props.author ? i18n.translate( 'by %(author)s', { args: { author: this.props.author } } ) : placeholder;

		return (
			<div className="themes__sheet-bar">
				<span className="themes__sheet-bar-title">{ title }</span>
				<span className="themes__sheet-bar-tag">{ tag }</span>
			</div>
		);
	},

	renderScreenshot() {
		const img = <img className="themes__sheet-img" src={ this.props.screenshot + '?=w680' } />;
		return (
			<div className="themes__sheet-screenshot">
				<a className="themes__sheet-preview-link" onClick={ this.togglePreview } >
					<Gridicon icon="themes" size={ 18 } />
					<span className="themes__sheet-preview-link-text">{ i18n.translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }</span>
				</a>
				{ this.props.screenshot && img }
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
			<SectionNav className="themes__sheet-section-nav" selectedText={ filterStrings[ currentSection ] }>
				{ this.props.name && nav }
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
				<Card className="themes__sheet-content">
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
				<Card className="themes__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />
				</Card>
			</div>
		);
	},

	renderSupportTab() {
		return (
			<div>
				<Card className="themes__sheet-card-support">
					<Gridicon icon="comment" size={ 48 } />
					<div className="themes__sheet-card-support-details">
						{ i18n.translate( 'Need extra help?' ) }
						<small>{ i18n.translate( 'Visit the theme support forum' ) }</small>
					</div>
					<Button primary={ true } href={ getForumUrl( this.props ) }>Visit forum</Button>
				</Card>
				<Card className="themes__sheet-card-support">
					<Gridicon icon="briefcase" size={ 48 } />
					<div className="themes__sheet-card-support-details">
						{ i18n.translate( 'Need CSS help? ' ) }
						<small>{ i18n.translate( 'Visit the CSS customization forum' ) }</small>
					</div>
					<Button href="//en.forums.wordpress.com/forum/css-customization">Visit forum</Button>
				</Card>
			</div>
		);
	},

	renderFeaturesCard() {
		const themeFeatures = this.props.taxonomies && this.props.taxonomies.theme_feature instanceof Array
		? this.props.taxonomies.theme_feature.map( function( item ) {
			return ( <li key={ 'theme-features-item-' + item.slug }><span>{ item.name }</span></li> );
		} ) : [];

		return (
			<div>
				<SectionHeader label={ i18n.translate( 'Features' ) } />
				<Card>
					<ul className="themes__sheet-features-list">
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
		return(
			<ThemePreview showPreview={ this.state.showPreview }
				theme={ this.props }
				onClose={ this.togglePreview }
			>
				<ThemePickButton theme={ this.getTheme() } />
			</ThemePreview>
		);
	},

	renderError() {
		const emptyContentTitle = i18n.translate( 'Looking for great WordPress designs?', {
			comment: 'Message displayed when requested theme was not found',
		} );
		const emptyContentMessage = i18n.translate( 'Check our theme showcase', {
			comment: 'Message displayed when requested theme was not found',
		} );

		return(
			<Main>
				<EmptyContentComponent
					title={ emptyContentTitle }
					line={ emptyContentMessage }
					action={ i18n.translate( 'View the showcase' ) }
					actionURL="/design"/>
			</Main>
		);
	},

	renderRelatedThemes() {
		return <ThemesRelatedCard currentTheme={ this.props.id } />;
	},

	renderSheet() {
		const section = this.validateSection( this.props.section );
		const siteID = this.props.selectedSite && this.props.selectedSite.ID;

		const analyticsPath = `/theme/:slug${ section ? '/' + section : '' }${ siteID ? '/:site_id' : '' }`;
		const analyticsPageTitle = `Themes > Details Sheet${ section ? ' > ' + titlecase( section ) : '' }${ siteID ? ' > Site' : '' }`;

		return (
			<Main className="themes__sheet">
			<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle }/>
				{ this.renderBar() }
				{ siteID && <QueryCurrentTheme siteId={ siteID }/> }
				<ThanksModal
					site={ this.props.selectedSite }
					source={ 'details' }/>
				{ this.state.showPreview && this.renderPreview() }
				<HeaderCake className="themes__sheet-action-bar"
							backHref={ this.props.backPath }
							backText={ i18n.translate( 'All Themes' ) }>
					<ThemePickButton className="themes__sheet__theme-pick-button"
						theme={ this.getTheme() }
					/>
				</HeaderCake>
				<div className="themes__sheet-columns">
					<div className="themes__sheet-column-left">
						<div className="themes__sheet-content">
							{ this.renderSectionNav( section ) }
							{ this.renderSectionContent( section ) }
							<div className="footer__line"><Gridicon icon="my-sites" /></div>
						</div>
					</div>
					<div className="themes__sheet-column-right">
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

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
		const backPath = getBackPath( state );
		return { selectedSite, siteSlug, backPath };
	}
)( ThemeSheet );
