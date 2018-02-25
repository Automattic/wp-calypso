/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

class SkipNavigation extends React.Component {
	static propTypes = {
		skipToElementId: PropTypes.string,
	};

	render() {
		return (
			<a
				href={ '#' + this.props.skipToElementId }
				className="sidebar__skip-navigation"
				data-tip-target={ this.props.tipTarget }
			>
				{ this.props.translate( 'Skip navigation' ) }
			</a>
		);
	}
}

export default localize( SkipNavigation );
