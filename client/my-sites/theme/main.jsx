/** @ssr-ready **/

/* eslint-disable react/no-danger  */
// FIXME!!!^ we want to ensure we have sanitised data…

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

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
import { signup, purchase, activate } from 'state/themes/actions';
import i18n from 'lib/mixins/i18n';
import { getSelectedSite } from 'state/ui/selectors';

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
		isLoggedIn: React.PropTypes.bool,
		// Connected props
		selectedSite: React.PropTypes.object,
	},

	getDefaultProps() {
		return { section: 'overview' };
	},

	onBackClick() {
		page.back();
	},

	isPremium() {
		return this.props.price.value > 0;
	},

	onPrimaryClick() {
		// TODO: if active -> customize (could use theme slug from selected site)

		if ( ! this.props.isLoggedIn ) {
			this.props.dispatch( signup( this.props ) );
		// TODO: use site picker if no selected site
		} else if ( this.isPremium() ) {
			// TODO: check theme is not already purchased
			this.props.dispatch( purchase( this.props, this.props.selectedSite, 'showcase-sheet' ) );
		} else {
			this.props.dispatch( activate( this.props, this.props.selectedSite, 'showcase-sheet' ) );
		}
	},

	getContentElement( section ) {
		return {
			overview: <div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />,
			setup: <div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />,
			support: <div>Visit the support forum</div>,
		}[ section ];
	},

	getDangerousElements( section ) {
		const priceElement = <span className="themes__sheet-action-bar-cost" dangerouslySetInnerHTML={ { __html: this.props.price } } />;
		const themeContentElement = this.getContentElement( section );
		return { priceElement, themeContentElement };
	},

	validateSection( section ) {
		const validSections = [ 'overview', 'support' ];
		this.props.supportDocumentation && validSections.push( 'setup' );
		if ( validSections.indexOf( section ) === -1 ) {
			return 'overview';
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

		const { selectedSite, id, supportDocumentation } = this.props;
		const siteSlug = selectedSite ? selectedSite.slug : '';

		function navItem( section ) {
			return(
				<NavItem
					path={ `/theme/${ id }/${ section }/${ siteSlug }` }
					selected={ section === currentSection }>
					{ filterStrings[ section ] }
				</NavItem>
			);
		}

		const nav = (
			<NavTabs label="Details" >
				{ navItem( 'overview' ) }
				{ supportDocumentation && navItem( 'setup' ) }
				{ navItem( 'support' ) }
			</NavTabs>
		);

		return (
			<SectionNav className="themes__sheet-section-nav" selectedText={ filterStrings[currentSection] }>
				{ this.props.name && nav }
			</SectionNav>
		);
	},

	renderFeatures() {
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
		const { themeContentElement, priceElement } = this.getDangerousElements( section );

		return (
			<Main className="themes__sheet">
				{ this.renderBar() }
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
							<Card className="themes__sheet-content">{ themeContentElement }</Card>
							{ this.renderFeatures() }
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

export default connect( ( state ) => ( {
	selectedSite: getSelectedSite( state ),
} ) )( ThemeSheet );
