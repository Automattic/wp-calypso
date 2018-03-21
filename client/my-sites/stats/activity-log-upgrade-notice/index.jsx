/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { getSiteSlug } from 'state/sites/selectors';
import { getRewindState } from 'state/selectors';

class ActivityLogUpgradeNotice extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
		needsPlan: PropTypes.bool.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	render() {
		if ( ! this.props.needsPlan ) {
			return false;
		}

		const {
			siteSlug,
			translate,
		} = this.props;

		return [
			<Banner
				plan="personal-bundle"
				href={ `/plans/${ siteSlug }` }
				callToAction={ translate( 'Upgrade' ) }
				title={ translate( 'Upgrade your Jetpack plan to restore your site to events in the past.' ) }
			/>,
		];
	}
}

export default connect(
	( state, { siteId } ) => {
		return {
			siteSlug: getSiteSlug( state, siteId ),
			needsPlan: getRewindState( state, siteId ).reason === 'missing_plan',
		};
	}
)( localize( ActivityLogUpgradeNotice ) );
