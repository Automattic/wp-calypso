/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Popover } from '@wordpress/components';


Popover.displayName = 'Popover';

export default class extends React.PureComponent {
	static displayName = 'Popover';

	state = {
		isVisible: false,
	};

	toggleVisible = () => {
		const { isVisible } = this.state.isVisible;
		this.setState( {
			isVisible: ! isVisible,
		} );
	};

	render() {
		return (
			<button onClick={ this.toggleVisible }>
				Toggle Popover!
				{ this.state.isVisible && (
					<Popover
						onClose={ this.toggleVisible }
						onClick={ ( event ) => event.stopPropagation() }
						focusOnMount
					>
						Popover is toggled!
					</Popover>
				) }
			</button>
		);
	}
};
