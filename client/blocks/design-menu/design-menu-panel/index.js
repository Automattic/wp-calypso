/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const DesignMenuPanel = React.createClass( {
	propTypes: {
		label: React.PropTypes.string.isRequired,
	},

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
} );

export default DesignMenuPanel;
