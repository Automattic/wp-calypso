/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
* Interal dependencies
*/
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'Checkbox',

	propTypes: {
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
			disabled: false
		};
	},

	handleChange( e ) {
		const { onChange } = this.props;

		onChange && onChange( e, this.state.checked );
	},

	handleFocus() {
		this.setState( {
			focused: true
		} )
	},

	handleBlur() {
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
					id = { id }
					name = { name }
					checked = { checked }
					disabled = { disabled }
					onChange = { this.handleChange }
					onFocus = { this.handleFocus }
					onBlur = { this.handleBlur } />
				{ children }
				{ checked && <Gridicon icon="checkmark" size={ 18 } /> }
			</label>
		);
	}
} );
