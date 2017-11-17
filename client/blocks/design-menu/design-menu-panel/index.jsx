/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class DesignMenuPanel extends React.Component {
	static propTypes = {
		label: PropTypes.string.isRequired,
	};

	render() {
		return (
			<div className="design-menu-panel">
				<Card compact className="design-menu-panel__label">
					<span>{ this.props.label }</span>
				</Card>
				<Card compact className="design-menu-panel__content">
					{ this.props.children }
				</Card>
			</div>
		);
	}
}

export default DesignMenuPanel;
