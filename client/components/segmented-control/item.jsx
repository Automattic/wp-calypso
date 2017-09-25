/**
 * External Dependencies
 */
import React from 'react';

import classNames from 'classnames';

/**
 * SegmentedControlItem
 */
const SegmentedControlItem = React.createClass( {

	propTypes: {
		children: React.PropTypes.node.isRequired,
		path: React.PropTypes.string,
		selected: React.PropTypes.bool,
		title: React.PropTypes.string,
		value: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			selected: false
		};
	},

	render: function() {
		const itemClassName = classNames( {
			'segmented-control__item': true,
			'is-selected': this.props.selected
		} );

		const linkClassName = classNames( 'segmented-control__link', {
			[ `item-index-${ this.props.index }` ]: this.props.index != null,
		} );

		return (
			<li className={ itemClassName }>
				<a
					href={ this.props.path }
					className={ linkClassName }
					ref="itemLink"
					onClick={ this.props.onClick }
					title={ this.props.title }
					data-e2e-value={ this.props.value }
					role="radio"
					tabIndex={ 0 }
					aria-selected={ this.props.selected }>
					<span className="segmented-control__text">
						{ this.props.children }
					</span>
				</a>
			</li>
		);
	}
} );

module.exports = SegmentedControlItem;
