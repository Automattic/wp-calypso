/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { includes, omit } from 'lodash';

export default class MultiCheckbox extends Component {
	static propTypes = {
		checked: PropTypes.array,
		defaultChecked: PropTypes.array,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
		options: PropTypes.array.isRequired,
		name: PropTypes.string,
	};

	static defaultProps = {
		defaultChecked: Object.freeze( [] ),
		disabled: false,
		onChange: () => {},
		name: 'multiCheckbox'
	};

	state = {
		initialChecked: this.props.defaultChecked
	};

	handleChange = ( event ) => {
		const target = event.target;
		let checked = this.props.checked || this.state.initialChecked;
		checked = checked.concat( [ target.value ] ).filter( ( currentValue ) => {
			return currentValue !== target.value || target.checked;
		} );

		this.props.onChange( {
			value: checked
		} );

		event.stopPropagation();
	};

	render() {
		const { disabled, name, options } = this.props;
		const checked = this.props.checked || this.state.initialChecked;
		return (
			<div className="multi-checkbox" { ...omit( this.props, Object.keys( MultiCheckbox.propTypes ) ) }>
				{ options.map( ( option ) => (
					<label key={ option.value }>
						<input
							name={ name + '[]' }
							type="checkbox"
							value={ option.value }
							checked={ includes( checked, option.value ) }
							onChange={ this.handleChange }
							disabled={ disabled }
						/>
						<span>{ option.label }</span>
					</label>
				) ) }
			</div>
		);
	}
}
