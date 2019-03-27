/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { itemLinkMatches } from './utils';
import SidebarItem from 'layout/sidebar/item';
import { emailManagement } from 'my-sites/email/paths';

class EmailSidebarItem extends PureComponent {
	render() {
		const { isAtomicSite, isJetpack, selectedSiteSlug, translate } = this.props;
		return (
			isJetpack &&
			! isAtomicSite && (
				<SidebarItem
					label={ translate( 'G Suite' ) }
					selected={ itemLinkMatches( [ '/email/' ], this.props.path ) }
					link={ emailManagement( selectedSiteSlug ) }
					// onNavigate={ this.trackDomainsClick }
					icon="mail"
					preloadSectionName="gsuite"
					tipTarget="gsuite"
				>
					{ /* <SidebarButton
					onClick={ this.trackSidebarButtonClick( 'add_domain' ) }
					href={ addEmailLink }
				>
					{ translate( 'Add' ) }
				</SidebarButton> */ }
				</SidebarItem>
			)
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
	isJetpack: isJetpackSite( state, siteId ),
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( localize( EmailSidebarItem ) );
