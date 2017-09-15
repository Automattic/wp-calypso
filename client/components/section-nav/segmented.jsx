var PropTypes = require('prop-types');
/**
 * External Dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
var SegmentedControl = require( 'components/segmented-control' ),
	ControlItem = require( 'components/segmented-control/item' );

/**
 * Internal variables
 */
var _instance = 1;

/**
 * Main
 */
var NavSegmented = React.createClass( {

	propTypes: {
		label: PropTypes.string,
		hasSiblingControls: PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			hasSiblingControls: false
		};
	},

	componentWillMount: function() {
		this.id = _instance;
		_instance++;
	},

	render: function() {
		var segmentedClassName = classNames( {
			'section-nav-group': true,
			'section-nav__segmented': true,
			'has-siblings': this.props.hasSiblingControls
		} );

		return (
			<div className={ segmentedClassName }>
				{
					this.props.label &&
					<h6 className="section-nav-group__label">{ this.props.label }</h6>
				}

				<SegmentedControl>
					{ this.getControlItems() }
				</SegmentedControl>
			</div>
		);
	},

	getControlItems: function() {
		return React.Children.map( this.props.children, function( child, index ) {
			return (
				<ControlItem
					{ ...child.props }
					key={ 'navSegmented-' + this.id + '-' + index }
				>
					{ child.props.children }
				</ControlItem>
			);
		}, this );
	}
} );

module.exports = NavSegmented;
