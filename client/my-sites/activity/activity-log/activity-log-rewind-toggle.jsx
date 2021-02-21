/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { activateRewind } from 'calypso/state/activity-log/actions';
import isRewindActivating from 'calypso/state/selectors/is-rewind-activating';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './activity-log-rewind-toggle.scss';

class ActivityLogRewindToggle extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		label: PropTypes.string,
		isVpMigrate: PropTypes.bool,

		// mappedSelectors
		isActivating: PropTypes.bool.isRequired,

		// bound dispatch
		activateRewind: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isActivating: false,
		label: '',
		isVpMigrate: false,
	};

	activateRewind = () => this.props.activateRewind( this.props.siteId, this.props.isVpMigrate );

	render() {
		const { isActivating, siteId, translate, label } = this.props;

		const isSiteKnown = !! siteId;

		return (
			<Button
				className="activity-log__rewind-toggle"
				busy={ isSiteKnown && isActivating }
				primary
				disabled={ ! isSiteKnown || isActivating }
				onClick={ this.activateRewind }
			>
				{ label ? label : translate( 'Activate Rewind' ) }
			</Button>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isActivating: isRewindActivating( state, siteId ),
	} ),
	{
		activateRewind: ( siteId, isVpMigrate ) =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_vp_migrate_rewind', {
					rewind_opt_in: isVpMigrate,
				} ),
				activateRewind( siteId, isVpMigrate )
			),
	}
)( localize( ActivityLogRewindToggle ) );
