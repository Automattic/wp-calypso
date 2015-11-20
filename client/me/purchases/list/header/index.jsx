/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import paths from '../../paths.js';
import SectionNav from 'components/section-nav';
import config from 'config';

const PurchasesHeader = React.createClass( {
	getSelectedText( activeSection ) {
		if( activeSection === 'purchases' ) {
			return this.translate( 'Purchases' );
		} else {
			return this.translate( 'Billing History' );
		}
	},

	render() {
		var activeSection = this.props.section;

		return(
			<SectionNav selectedText={ this.getSelectedText( activeSection ) }>
				<NavTabs>
					{
						config.isEnabled( 'upgrades/purchases/list' ) ?
						<NavItem path={ paths.list() } selected={ activeSection === 'purchases' }>{ this.translate( 'Purchases' ) }</NavItem> :
						null
					}
					<NavItem path="/me/billing" selected= { activeSection === 'billing' } >{ this.translate( 'Billing History' ) }</NavItem>
				</NavTabs>
			</SectionNav>
		);
	}
} );

export default PurchasesHeader;
