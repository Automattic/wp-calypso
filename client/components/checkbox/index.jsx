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
		checked: PropTypes.bool.isRequired,
		disabled: PropTypes.bool,
		onChange: PropTypes.func
	},

	getInitialState() {
		return {
			focused: false
		}
	},

	getDefaultProps() {
		return {
			disabled: false,
			onChange: noop
		};
	},

	change() {
		const { checked, onChange } = this.props;
		onChange( ! checked );
	},

	focus() {
		this.setState( {
			focused: true
		} )
	},

	blur() {
		this.setState( {
			focused: false
		} )
	},

	render() {
		const { focused } = this.state;
		const { className, children, checked, disabled, id, name } = this.props;
		const classes = classNames( className, 'checkbox', {
			'is-focused': focused,
			'is-disabled': disabled
		} );

		return (
			<label className={ classes } >
				<input type="checkbox"
					id={ id }
					name={ name }
					checked={ checked }
					disabled={ disabled }
					onChange={ this.change }
					onFocus={ this.focus }
					onBlur={ this.blur } />
				{ children }
				{ checked && <Gridicon icon="checkmark" size={ 18 } /> }
			</label>
		);
	}
} );
