/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { warningNotice } from 'state/notices/actions';

import {
	isJetpackSite,
	getSiteAdminUrl,
	getSiteDomain,
	siteHasMinimumJetpackVersion
} from 'state/sites/selectors';

class NonSupportedJetpackVersionNotice extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		minimumJetpackVersionFailed: PropTypes.bool.isRequired,
		adminUrl: PropTypes.string,
		domain: PropTypes.string,
	};

	// TODO: Refactor to use Redux notices middleware after plugins have been migrated to use Redux
	showWarning( {
		adminUrl,
		domain,
		minimumJetpackVersionFailed,
		siteId,
		translate,
		triggerNotice
	} ) {
		if ( minimumJetpackVersionFailed ) {
			const jetpackMinVersion = config( 'jetpack_min_version' );
			triggerNotice(
				translate(
					'Jetpack %(version)s is required to take full advantage of plugin management in %(site)s.',
					{
						args: {
							version: jetpackMinVersion,
							site: domain
						}
					}
				), {
					button: translate( 'Update now' ),
					href: adminUrl,
					id: `allSitesNotOnMinJetpackVersion-${ jetpackMinVersion }-${ siteId }`
				}
			);
		}
	}

	componentWillMount() {
		this.showWarning( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.showWarning( nextProps );
	}

	render() {
		return null;
	}
}

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			siteId: selectedSiteId,
			adminUrl: getSiteAdminUrl( state, selectedSiteId, 'plugins.php?plugin_status=upgrade' ),
			domain: getSiteDomain( state, selectedSiteId ),
			minimumJetpackVersionFailed: !! isJetpackSite( state, selectedSiteId ) &&
				! siteHasMinimumJetpackVersion( state, selectedSiteId )
		};
	},
	{
		triggerNotice: warningNotice
	}
)( localize( NonSupportedJetpackVersionNotice ) );
