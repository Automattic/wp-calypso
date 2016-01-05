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

	getDefaultProps() {
		return {
			disabled: false
		};
	},

	getInitialState() {
		const { checked } = this.props;

		return {
			checked: checked
		}
	},

	handleChange( e ) {
		const checked = e.target.checked;
		const { onChange } = this.props;

		this.setState( {
			checked: checked
		} )

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
		const { checked, focused } = this.state;
		const { className, children, disabled } = this.props;
		const classes = classNames( className, 'checkbox', {
			'is-focused': focused,
			'is-disabled': disabled
		} );

		return (
			<label className={ classes } >
				<input type="checkbox"
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
