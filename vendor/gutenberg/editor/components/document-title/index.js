/**
 * External dependencies
 */
import { Component } from 'react';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

class DocumentTitle extends Component {
	constructor( props ) {
		super( props );
		this.originalDocumentTitle = document.title;
	}

	componentDidMount() {
		this.setDocumentTitle( this.props.title );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.title !== this.props.title ) {
			this.setDocumentTitle( this.props.title );
		}
	}

	componentWillUnmount() {
		document.title = this.originalDocumentTitle;
	}

	setDocumentTitle( title ) {
		document.title = title + ' | ' + this.originalDocumentTitle;
	}

	render() {
		return null;
	}
}

export default withSelect( ( select ) => ( {
	title: select( 'core/editor' ).getDocumentTitle(),
} ) )( DocumentTitle );
