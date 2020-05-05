/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

class SkipNavigation extends React.Component {
	static propTypes = {
		skipToElementId: PropTypes.string,
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
		return (
			<Button onClick={ this.onClick } className="sidebar__skip-navigation">
				{ this.props.translate( 'Skip navigation' ) }
			</Button>
		);
	}
}

export default localize( SkipNavigation );
