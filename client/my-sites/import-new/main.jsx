/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite } from 'state/ui/selectors';

class ImportMain extends Component {
	render() {
		const { translate } = this.props;
		return (
			<Main className="import-new">
				<DocumentHead title={ translate( 'Import' ) } />
				<SidebarNavigation />
				ohai, hullo.
			</Main>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( ImportMain ) );
