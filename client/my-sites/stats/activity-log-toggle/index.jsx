/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ActivityLogToggle extends Component {

	static propTypes = {
		activateRewind: PropTypes.func,
		deactivateRewind: PropTypes.func,
		isActivatingRewind: PropTypes.bool,
		isDeactivatingRewind: PropTypes.bool,
		isActive: PropTypes.bool
	};

	activateRewind = event => {
		this.props.activateRewind( this.props.siteId );
		event.stopPropagation();
	};

	deactivateRewind = event => {
		this.props.deactivateRewind( this.props.siteId );
		event.stopPropagation();
	};

	render() {
		const isToggling = this.props.isActivatingRewind || this.props.isDeactivatingRewind;
		return (
			<div>
				<Button
					primary={ true }
					compact
					onClick={ this.props.isActive ? this.deactivateRewind : this.activateRewind }
					className={ isToggling
					? 'is-busy'
					: ''
				}
				>
					{ this.props.isActive ? this.props.translate( 'Deactivate Rewind' ) : this.props.translate( 'Activate Rewind' ) }
				</Button>
				<br /><br />
			</div>
		);
	}
}

export default localize( ActivityLogToggle );
