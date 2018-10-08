/**
 * Wordpress dependencies
 */

import { Component } from '@wordpress/element';
import { withSelect, dispatch } from '@wordpress/data';
import { RichText } from '@wordpress/editor';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

export class BoundTitleText extends Component {

	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind(this);
	}

	render() {
		const { tagName, className, value, placeholder } = this.props;
		return (
			<RichText
				tagName={ tagName }
				className={ className }
				value={ value }
				placeholder={ placeholder }
				onChange={ this.onChange }
				format='string'
				formattingControls={ [] }
			/>
		);
	}

	onChange( title ) {
		const { onChange } = this.props;
		dispatch('core/editor').editPost( { title } );
		onChange( title );
	}

}

export default withSelect( ( select, ownProps ) => {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const value = getEditedPostAttribute( 'title' );
	if ( ownProps.value === value ) {
		return;
	}
	if ( ownProps.onChange ) {
		ownProps.onChange( value );
	}
	return ( { value } );
} )( BoundTitleText );

BoundTitleText.defaultProps = {
	onChange: () => {}
}
