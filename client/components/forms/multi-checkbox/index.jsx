/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { omit } from 'lodash';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:forms:multi-checkbox' );

export default class MultiCheckbox extends Component {
	static propTypes = {
		checked: PropTypes.array,
		defaultChecked: PropTypes.array,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
		options: PropTypes.array,
		name: PropTypes.string,
	};

	static defaultProps = {
		defaultChecked: Object.freeze( [] ),
		onChange: function() {},
		disabled: false
	};

	state = {
		initialChecked: this.props.defaultChecked
	};

	componentWillMount() {
		debug( 'Mounting MultiCheckbox React component.' );
	}

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

	getCheckboxElements() {
		const checked = this.props.checked || this.state.initialChecked;

		return this.props.options.map( ( option ) => {
			const isChecked = checked.indexOf( option.value ) !== -1;

			return (
				<label key={ option.value }>
					<input
						name={ this.props.name + '[]' }
						type="checkbox" value={ option.value }
						checked={ isChecked }
						onChange={ this.handleChange }
						disabled={ this.props.disabled }
					/>
					<span>{ option.label }</span>
				</label>
			);
		}, this );
	}

	render() {
		return (
			<div className="multi-checkbox" { ...omit( this.props, Object.keys( MultiCheckbox.propTypes ) ) }>
				{ this.getCheckboxElements() }
			</div>
		);
	}
}
