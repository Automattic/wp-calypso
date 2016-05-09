/** @ssr-ready **/

/* eslint-disable react/no-danger  */
// FIXME!!!^ we want to ensure we have sanitised data…

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import { isPremium } from 'my-sites/themes/helpers';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { signup, purchase, activate, clearActivated } from 'state/themes/actions';
import i18n from 'lib/mixins/i18n';
import { getSelectedSite } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import Helpers from 'my-sites/themes/helpers';
import ActivatingTheme from 'components/data/activating-theme';
import ThanksModal from 'my-sites/themes/thanks-modal';

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
		taxonomies: React.PropTypes.object,
		stylesheet: React.PropTypes.string,
		isLoggedIn: React.PropTypes.bool,
		// Connected props
		selectedSite: React.PropTypes.object,
		siteSlug: React.PropTypes.string,
	},

	getDefaultProps() {
		return { section: 'overview' };
	},

	onBackClick() {
		page.back();
	},

	onPrimaryClick() {
		// TODO: if active -> customize (could use theme slug from selected site)

		if ( ! this.props.isLoggedIn ) {
			this.props.dispatch( signup( this.props ) );
		// TODO: use site picker if no selected site
		} else if ( isPremium( this.props ) ) {
			// TODO: check theme is not already purchased
			this.props.dispatch( purchase( this.props, this.props.selectedSite, 'showcase-sheet' ) );
		} else {
			this.props.dispatch( activate( this.props, this.props.selectedSite, 'showcase-sheet' ) );
		}
	},

	getValidSections() {
		const validSections = [];
		validSections.push( 'overview' );
		this.props.supportDocumentation && validSections.push( 'setup' );
		validSections.push( 'support' );
		return validSections;
	},

	validateSection( section ) {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[0];
		}
		return section;
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
				{ this.props.screenshot && img }
			</div>
		);
	},

	renderSectionNav( currentSection ) {
		const filterStrings = {
			overview: i18n.translate( 'Overview', { context: 'Filter label for theme content' } ),
			setup: i18n.translate( 'Setup', { context: 'Filter label for theme content' } ),
			support: i18n.translate( 'Support', { context: 'Filter label for theme content' } ),
		};

		const { siteSlug, id } = this.props;

		const nav = (
			<NavTabs label="Details" >
				{ this.getValidSections().map( ( section ) => (
					<NavItem key={ section }
						path={ `/theme/${ id }/${ section }/${ siteSlug }` }
						selected={ section === currentSection }>
						{ filterStrings[ section ] }
					</NavItem>
				) ) }
			</NavTabs>
		);

		return (
			<SectionNav className="themes__sheet-section-nav" selectedText={ filterStrings[currentSection] }>
				{ this.props.name && nav }
			</SectionNav>
		);
	},

	renderSectionContent( section ) {
		return {
			overview: this.renderOverviewTab(),
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
					<Button primary={ true } href={ Helpers.getForumUrl( this.props ) }>Visit forum</Button>
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
		const themeFeatures = this.props.taxonomies && this.props.taxonomies.features instanceof Array
		? this.props.taxonomies.features.map( function( item, i ) {
			return ( <li key={ 'theme-features-item-' + i++ }><span>{ item.name }</span></li> );
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

	render() {
		let actionTitle = <span className="themes__sheet-button-placeholder">loading......</span>;
		if ( this.props.isLoggedIn && this.props.active ) { //FIXME: active ENOENT
			actionTitle = i18n.translate( 'Customize' );
		} else if ( this.props.name ) {
			actionTitle = i18n.translate( 'Pick this design' );
		}

		const section = this.validateSection( this.props.section );
		const priceElement = <span className="themes__sheet-action-bar-cost" dangerouslySetInnerHTML={ { __html: this.props.price } } />;
		const siteID = this.props.selectedSite && this.props.selectedSite.ID;

		return (
			<Main className="themes__sheet">
				{ this.renderBar() }
				<ActivatingTheme siteId={ siteID }>
					<ThanksModal
						site={ this.props.selectedSite }
						source={ 'details' }
						clearActivated={ bindActionCreators( clearActivated, this.props.dispatch ) }/>
				</ActivatingTheme>
				<div className="themes__sheet-columns">
					<div className="themes__sheet-column-left">
						<HeaderCake className="themes__sheet-action-bar" onClick={ this.onBackClick }>
							<div className="themes__sheet-action-bar-container">
								<Button onClick={ this.onPrimaryClick }>
									{ actionTitle }
									{ priceElement }
								</Button>
							</div>
						</HeaderCake>
						<div className="themes__sheet-content">
							{ this.renderSectionNav( section ) }
							{ this.renderSectionContent( section ) }
							<div className="footer__line"><Gridicon icon="my-sites" /></div>
						</div>
					</div>
					<div className="themes__sheet-column-right">
						<Card className="themes_sheet-action-bar-spacer"/>
						{ this.renderScreenshot() }
					</div>
				</div>
			</Main>
		);
	}
} );

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
	return { selectedSite, siteSlug };
} )( ThemeSheet );
