/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import { InspectorControls, RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import IsoPoc from './component.js';

class IsoPocEdit extends Component {
	constructor() {
		super( ...arguments );
	}
	updateComplex = ( value, index ) => {
		const { attributes, setAttributes } = this.props;
		const complex = attributes.complex.slice( 0 );
		complex[ index ] = value;
		setAttributes( { complex } );
	};
	render() {
		const { attributes, className, setAttributes } = this.props;
		const { complex, content, simple } = attributes;
		return (
			<Fragment>
				<InspectorControls>
					<TextControl
						label={ 'Simple' }
						value={ simple }
						onChange={ value => setAttributes( { simple: value } ) }
					/>
					<TextControl
						label={ 'Complex item 1' }
						value={ complex[ 0 ] }
						onChange={ value => this.updateComplex( value, 0 ) }
					/>
					<TextControl
						label={ 'Complex item 2' }
						value={ complex[ 1 ] }
						onChange={ value => this.updateComplex( value, 1 ) }
					/>
				</InspectorControls>
				<div className={ className }>
					<IsoPoc simple={ simple } complex={ complex }>
						<RichText
							inlineToolbar
							placeholder={ 'Child element' }
							tagName="figcaption"
							value={ content }
							onChange={ value => setAttributes( { content: value } ) }
						/>
					</IsoPoc>
				</div>
			</Fragment>
		);
	}
}

export default IsoPocEdit;
