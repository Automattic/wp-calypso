/**
 * External Dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * SegmentedControlItem
 */
var SegmentedControlItem = React.createClass( {

	propTypes: {
		children: React.PropTypes.node.isRequired,
		path: React.PropTypes.string,
		selected: React.PropTypes.bool,
		title: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			selected: false
		};
	},

	render: function() {
		var itemClassName = classNames( {
			'segmented-control__item': true,
			'is-selected': this.props.selected
		} );

		return (
			<li className={ itemClassName }>
				<a
					href={ this.props.path }
					className="segmented-control__link"
					ref="itemLink"
					onTouchTap={ this.props.onClick }
					title={ this.props.title }
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
