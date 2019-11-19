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
								: `/start/rewind-setup/?siteId=${ siteId }&siteSlug=${ slug }`
						}
						title={ translate( 'Add site credentials' ) }
						description={ translate(
							'Backups and security scans require access to your site to work properly.'
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
