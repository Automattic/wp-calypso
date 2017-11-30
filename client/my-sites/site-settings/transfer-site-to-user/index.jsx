/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import TransferSiteToUserWarning from './warning';

class TransferSiteToUser extends React.Component {
	constructor( props ) {
		super( props );
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="transfer-site-to-user">
				<HeaderCake backHref={ '/settings/general/' + siteSlug }>
					<h1>{ translate( 'Transfer Your Site' ) }</h1>
				</HeaderCake>
				<TransferSiteToUserWarning />
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( TransferSiteToUser ) );
