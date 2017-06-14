/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import {
	activateRewind as activateRewindAction,
} from 'state/activity-log/actions';
import { isRewindActivating } from 'state/selectors';

class ActivityLogRewindToggle extends Component {
	static propTypes = {
		// passed
		siteId: PropTypes.number,

		// mappedSelectors
		isActivating: PropTypes.bool.isRequired,

		// bound dispatch
		activateRewind: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isActive: false,
		isActivating: false,
	};

	activateRewind = () => {
		const {
			activateRewind,
			siteId,
		} = this.props;

		activateRewind( siteId );
	};

	render() {
		const {
			isActivating,
			siteId,
			translate,
		} = this.props;

		const isSiteKnown = !! siteId;

		return (
			<Button
				compact={ true }
				className={ classNames( 'activity-log__rewind-toggle', {
					'is-busy': isSiteKnown && isActivating,
				} ) }
				disabled={ ! isSiteKnown || isActivating }
				primary
				onClick={ this.activateRewind }
			>
				{ translate( 'Activate Rewind' ) }
			</Button>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isActivating: isRewindActivating( state, siteId ),
	} ), {
		activateRewind: activateRewindAction,
	}
)( localize( ActivityLogRewindToggle ) );
