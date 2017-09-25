/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * SegmentedControlItem
 */
const SegmentedControlItem = React.createClass( {

	propTypes: {
		children: PropTypes.node.isRequired,
		path: PropTypes.string,
		selected: PropTypes.bool,
		title: PropTypes.string,
		value: PropTypes.string,
		onClick: PropTypes.func
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

export default SegmentedControlItem;
