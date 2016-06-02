/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';

/**
* Interal dependencies
*/
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'Checkbox',

	propTypes: {
		id: React.PropTypes.string,
		name: React.PropTypes.string,
		isChecked: PropTypes.bool.isRequired,
		isDisabled: PropTypes.bool,
		onChange: PropTypes.func
	},

	getInitialState() {
		return {
			isFocused: false
		}
	},

	getDefaultProps() {
		return {
			isDisabled: false,
			onChange: noop
		};
	},

	change() {
		const { isChecked, onChange } = this.props;
		onChange( ! isChecked );
	},

	focus() {
		this.setState( {
			isFocused: true
		} )
	},

	blur() {
		this.setState( {
			isFocused: false
		} )
	},

	render() {
		const { isFocused } = this.state;
		const { className, children, isChecked, isDisabled, id, name } = this.props;
		const classes = classNames( className, 'checkbox', {
			'is-focused': isFocused,
			'is-disabled': isDisabled
		} );

		return (
			<label className={ classes } >
				<input type="checkbox"
					id={ id }
					name={ name }
					checked={ isChecked }
					disabled={ isDisabled }
					onChange={ this.change }
					onFocus={ this.focus }
					onBlur={ this.blur } />
				{ children }
				{ isChecked && <Gridicon icon="checkmark" size={ 18 } /> }
			</label>
		);
	}
} );
