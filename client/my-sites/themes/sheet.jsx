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
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Card from 'components/card';
import { purchase, customize, activate, signup } from 'state/themes/actions';
import { getSelectedSite } from 'state/ui/selectors';
import ThemeHelpers from 'my-sites/themes/helpers';
import i18n from 'lib/mixins/i18n';

export const ThemeSheet = React.createClass( {
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
	},

	onBackClick() {
		page.back();
	},

	onPrimaryClick() {
		let action;

		if ( ThemeHelpers.isPremium( this.props ) && ! this.props.purchased && this.props.isLoggedIn ) { //FIXME: purchased ENOENT
			action = purchase( this.props, this.props.selectedSite, 'showcase-sheet' );
		} else if ( this.props.active ) { //FIXME: active ENOENT
			action = customize( this.props, this.props.selectedSite );
		} else if ( this.props.isLoggedIn ) {
			action = activate( this.props, this.props.selectedSite, 'showcase-sheet' );
		} else {
			action = signup( this.props );
		}

		this.props.dispatch( action );
	},

	getContentElement( section ) {
		return {
			details: <div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />,
			documentation: <div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />,
			support: <div>Visit the support forum</div>,
		}[ section ];
	},

	getDangerousElements( section ) {
		const priceElement = <span className="themes__sheet-action-bar-cost" dangerouslySetInnerHTML={ { __html: this.props.price } } />;
		const themeContentElement = this.getContentElement( section );
		return { priceElement, themeContentElement };
	},

	render() {
		let actionTitle;
		if ( this.props.isLoggedIn && this.props.active ) { //FIXME: active ENOENT
			actionTitle = i18n.translate( 'Customize' );
		} else if ( this.props.isLoggedIn ) {
			actionTitle = ThemeHelpers.isPremium( this.props ) && ! this.props.purchased //FIXME: purchased ENOENT
				? i18n.translate( 'Purchase & Activate' )
				: i18n.translate( 'Activate' );
		} else {
			actionTitle = i18n.translate( 'Start with this design' );
		}

		const section = this.props.section || 'details';
		const filterStrings = {
			details: i18n.translate( 'Details', { context: 'Filter label for theme content' } ),
			documentation: i18n.translate( 'Documentation', { context: 'Filter label for theme content' } ),
			support: i18n.translate( 'Support', { context: 'Filter label for theme content' } ),
		};

		const { themeContentElement, priceElement } = this.getDangerousElements( section );

		return (
			<Main className="themes__sheet">
				<div className="themes__sheet-bar">
					<span className="themes__sheet-bar-title">{ this.props.name }</span>
					<span className="themes__sheet-bar-tag">by { this.props.author }</span>
				</div>
				<div className="themes__sheet-columns">
					<div className="themes__sheet-column-left">
						<HeaderCake className="themes__sheet-action-bar" onClick={ this.onBackClick }>
							<div className="themes__sheet-action-bar-container">
								{ priceElement }
								<Button secondary >{ i18n.translate( 'Download' ) }</Button>
								<Button primary icon onClick={ this.onPrimaryClick }><Gridicon icon="checkmark"/>{ actionTitle }</Button>
							</div>
						</HeaderCake>
						<div className="themes__sheet-content">
							<SectionNav className="themes__sheet-section-nav" selectedText={ filterStrings[section] }>
								<NavTabs label="Details" >
									<NavItem path={ `/themes/${ this.props.id }/details` } selected={ section === 'details' } >{ i18n.translate( 'Details' ) }</NavItem>
									<NavItem path={ `/themes/${ this.props.id }/documentation` } selected={ section === 'documentation' } >{ i18n.translate( 'Documentation' ) }</NavItem>
									<NavItem path={ `/themes/${ this.props.id }/support` } selected={ section === 'support' } >{ i18n.translate( 'Support' ) }</NavItem>
								</NavTabs>
							</SectionNav>
							<Card className="themes__sheet-content">{ themeContentElement }</Card>
						</div>
					</div>
					<div className="themes__sheet-column-right">
						<Card className="themes_sheet-action-bar-spacer"/>
						<div className="themes__sheet-screenshot">
							<img className="themes__sheet-img" src={ this.props.screenshot + '?=w680' } />
						</div>
					</div>
				</div>
			</Main>
		);
	}
} )

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			selectedSite: getSelectedSite( state ) || false,
		}
	)
)( ThemeSheet );
