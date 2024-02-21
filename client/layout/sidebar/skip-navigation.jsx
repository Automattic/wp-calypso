import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

class SkipNavigation extends Component {
	static propTypes = {
		skipToElementId: PropTypes.string,
		displayText: PropTypes.string,
	};

	onClick = ( event ) => {
		event.preventDefault();
		const element = document.getElementById( this.props.skipToElementId );
		// Make the element focusable
		if ( ! /^(?:a|select|input|button|textarea)$/i.test( element.tagName ) ) {
			element.tabIndex = -1;
		}

		element.focus();
	};

	render() {
		const displayText = this.props.displayText || this.props.translate( 'Skip navigation' );

		return (
			<Button onClick={ this.onClick } className="sidebar__skip-navigation">
				{ displayText }
			</Button>
		);
	}
}

export default localize( SkipNavigation );
