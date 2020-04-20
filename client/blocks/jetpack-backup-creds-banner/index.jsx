/**
 * External dependencies
 */
import PropTypes from 'prop-types';
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
	static propTypes = {
		// Tracks event name on click
		event: PropTypes.string.isRequired,
		// Connected props
		isJetpack: PropTypes.bool,
		rewindState: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		// From localize()
		translate: PropTypes.func,
	};

	render() {
		const { event, isJetpack, rewindState, siteId, siteSlug, translate } = this.props;

		if ( ! isJetpack ) {
			return null;
		}
		return (
			<Fragment>
				{ siteId && <QueryRewindState siteId={ siteId } /> }
				{ 'awaitingCredentials' === rewindState.state && (
					<Banner
						event={ event }
						icon="history"
						href={
							rewindState.canAutoconfigure
								? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
								: `/settings/security/${ siteSlug }#credentials`
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

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		rewindState: getRewindState( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( JetpackBackupCredsBanner ) );
