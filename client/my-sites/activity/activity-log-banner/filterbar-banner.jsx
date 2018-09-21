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
import { isJetpackSite } from 'state/sites/selectors';
import Banner from 'components/banner';
import { PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_PERSONAL } from 'lib/plans/constants';

class FilterbarBanner extends Component {
	render() {
		const { translate, isJetpack } = this.props;
		return (
			<div className="activity-log-banner__filterbar">
				<Banner
					title={ translate( 'Filter your activity with a Personal Plan!' ) }
					event="activity_log_upgrade_click_filterbar"
					plan={ isJetpack ? PLAN_JETPACK_PERSONAL_MONTHLY : PLAN_PERSONAL }
				/>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
} ) )( localize( FilterbarBanner ) );
