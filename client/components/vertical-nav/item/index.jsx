/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';

const VerticalNavItem = React.createClass( {
	propTypes: {
		external: React.PropTypes.bool,
		isPlaceholder: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		path: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			external: false,
			isPlaceholder: false,
			onClick: noop
		};
	},

	placeholder() {
		return (
			<CompactCard className="vertical-nav-item is-placeholder">
				<span></span>
				<span></span>
			</CompactCard>
		);
	},

	render() {
		if ( this.props.isPlaceholder ) {
			return this.placeholder();
		}

		return (
			<a
				href={ this.props.path }
				onClick={ this.props.onClick }
				target={ this.props.external ? '_blank' : null }>
				<CompactCard className="vertical-nav-item">
					{ this.getIcon() }
					<span>{ this.props.children }</span>
				</CompactCard>
			</a>
		);
	},

	getIcon() {
		if ( this.props.external ) {
			return <Gridicon icon="external" />;
		}

		return <Gridicon icon="chevron-right" />;
	}
} );

export default VerticalNavItem;
