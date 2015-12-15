/**
 * External Dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Count = require( 'components/count' );

var SelectDropdownItem = React.createClass( {
	propTypes: {
		children: React.PropTypes.string.isRequired,
		path: React.PropTypes.string,
		selected: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		count: React.PropTypes.number
	},

	getDefaultProps: function() {
		return {
			selected: false
		};
	},

	render: function() {
		var optionClassName = classNames( this.props.className, {
			'select-dropdown__item': true,
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled
		} );

		return (
			<li className="select-dropdown__option">
				<a
					ref="itemLink"
					href={ this.props.path }
					className={ optionClassName }
					onClick={ this.props.disabled ? null : this.props.onClick }
					data-bold-text={ this.props.value || this.props.children }
					role="menuitem"
					tabIndex={ 0 }
					aria-selected={ this.props.selected } >
					<span className="select-dropdown__item-text">
						{ this.props.children }
						{
							'number' === typeof this.props.count &&
							<Count count={ this.props.count } />
						}
					</span>
				</a>
			</li>
		);
	}
} );

module.exports = SelectDropdownItem;
