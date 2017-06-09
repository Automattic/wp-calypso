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
	deactivateRewind as deactivateRewindAction,
} from 'state/activity-log/actions';

class ActivityLogRewindToggle extends Component {
	static propTypes = {
		// passed
		siteId: PropTypes.number,

		// mappedSelectors
		isActive: PropTypes.bool.isRequired,
		isToggling: PropTypes.bool.isRequired,

		// bound dispatch
		activateRewind: PropTypes.func.isRequired,
		deactivateRewind: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isActive: false,
		isToggling: false,
	};

	handleToggle = () => {
		const {
			activateRewind,
			deactivateRewind,
			isActive,
			siteId,
		} = this.props;
		if ( isActive ) {
			deactivateRewind( siteId );
		} else {
			activateRewind( siteId );
		}
	}

	render() {
		const {
			isActive,
			isToggling,
			siteId,
			translate,
		} = this.props;

		const buttonText = isActive
			? translate( 'Deactivate Rewind' )
			: translate( 'Activate Rewind' );

		const isSiteKnown = !! siteId;

		return (
			<Button
				compact={ true }
				className={ classNames( 'activity-log__rewind-toggle', {
					'is-busy': isSiteKnown && isToggling,
				} ) }
				disabled={ ! isSiteKnown || isToggling }
				primary={ isSiteKnown && isActive }
				onClick={ this.handleToggle }
			>
				{ buttonText }
			</Button>
		);
	}
}

export default connect(
	// FIXME: Selectors!
	() => ( {
		isToggling: false,
		isActive: false,
	} ), {
		activateRewind: activateRewindAction,
		deactivateRewind: deactivateRewindAction,
	}
)( localize( ActivityLogRewindToggle ) );
