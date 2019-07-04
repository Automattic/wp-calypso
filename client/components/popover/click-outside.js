/**
 * External dependencies
 */
import { Component } from 'react';
import clickOutside from 'react-click-outside';

class PopoverClickOutside extends Component {
	handleClickOutside( event ) {
		const { onClickOutside } = this.props;
		if ( onClickOutside ) {
			onClickOutside( event );
		}
	}

	render() {
		return this.props.children;
	}
}

export default clickOutside( PopoverClickOutside );
