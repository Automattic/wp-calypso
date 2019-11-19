/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';

class JetpackBackupCredsBanner extends Component {
	render() {
		const { isJetpack, rewindState, siteId, slug, translate } = this.props;

		return (
			// TODO: prop for tracks event
			// TODO: link to settings for creds entry
			<Fragment>
				{ siteId && isJetpack && <QueryRewindState siteId={ siteId } /> }
				{ 'awaitingCredentials' === rewindState.state && (
					<Banner
						icon="history"
						href={
							rewindState.canAutoconfigure
								? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ slug }`
								: `/settings/security/${ slug }`
						}
						title={ translate( 'Add your server credentials' ) }
						description={ translate(
							"Enter your site's server credentials to set up site restores from your backups."
						) }
					/>
				) }
			</Fragment>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		rewindState: getRewindState( state, siteId ),
		slug: getSiteSlug( state, siteId ),
	};
} )( localize( JetpackBackupCredsBanner ) );
