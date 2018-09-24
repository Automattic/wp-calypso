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
	render() {
		return (
			<RichText
				tagName={ this.props.tagName }
				className={ this.props.className }
				value={ this.props.value }
				placeholder={ this.props.placeholder }
				onChange={ this.onChange.bind(this) }
				format='string'
				formattingControls={ [] }
			/>
      	);
  	}
  	onChange( title ) {
    	dispatch('core/editor').editPost( { title } );
    	if ( this.props.onChange ) {
    		this.props.onChange( title );
    	}
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
