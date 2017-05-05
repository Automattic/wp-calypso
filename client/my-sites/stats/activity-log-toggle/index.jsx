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
		isDeactivatingRewind: PropTypes.bool
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
		return (
			<div>
				<Button
					primary={ true }
					compact
					onClick={ this.activateRewind }
					className={ this.props.isActivatingRewind
					? 'is-busy'
					: ''
				}
				>
					{ this.props.translate( 'Activate Rewind' ) }
				</Button>

				<Button
					primary={ true }
					compact
					onClick={ this.deactivateRewind }
					className={ this.props.isDeactivatingRewind
					? 'is-busy'
					: ''
				}
				>
					{ this.props.translate( 'Deactivate Rewind' ) }
				</Button>
				<br/><br/>
			</div>
		);
	}
}

export default localize( ActivityLogToggle );
