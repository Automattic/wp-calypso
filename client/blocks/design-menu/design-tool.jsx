/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

const debug = debugFactory( 'calypso:design-tool' );

class DesignToolInput extends React.Component {
	constructor( props ) {
		super( props );
		this.onChangeText = this.onChangeText.bind( this );
	}

	onChangeText( evt ) {
		const value = evt.target.value;
		this.props.onChange( { [ this.props.id ]: value } );
	}

	render() {
		switch ( this.props.type ) {
			case 'text':
				return (
					<FormFieldset>
						<FormLabel htmlFor={ this.props.id }>{ this.props.label }</FormLabel>
						<FormTextInput name={ this.props.id } value={ this.props.value } onChange={ this.onChangeText } />
					</FormFieldset>
				);
		}
		return null;
	}
}

DesignToolInput.propTypes = {
	type: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
};

class DesignTool extends React.Component {
	constructor( props ) {
		super( props );
		this.renderControl = this.renderControl.bind( this );
	}

	renderControl( control ) {
		debug( 'rendering design tool control', control );
		return <DesignToolInput
			key={ control.id }
			type={ control.input.type }
			label={ control.input.label }
			id={ control.id }
			onChange={ this.props.onChange }
			value={ this.props.values[ control.id ] }
		/>;
	}

	render() {
		return (
			<div className="design-menu__design-tool">
				{ this.props.controls.map( this.renderControl ) }
			</div>
		);
	}
}

DesignTool.propTypes = {
	controls: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired,
	values: PropTypes.object,
};

export default DesignTool;
