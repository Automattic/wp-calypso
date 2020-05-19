/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';

class InfoPopoverExample extends React.PureComponent {
	static displayName = 'InfoPopover';

	state = {
		popoverPosition: 'bottom left',
	};

	render() {
		return (
			<div>
				<label>
					Position
					<select value={ this.state.popoverPosition } onChange={ this._changePopoverPosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</select>
				</label>

				<br />

				<InfoPopover id="popover__info-popover-example" position={ this.state.popoverPosition }>
					Some informational text.
				</InfoPopover>
			</div>
		);
	}

	_changePopoverPosition = ( event ) => {
		this.setState( { popoverPosition: event.target.value } );
	};
}

export default InfoPopoverExample;
