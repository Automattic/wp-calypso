/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';

export default class FileBlockEditableLink extends Component {
	constructor() {
		super( ...arguments );

		this.copyLinkToClipboard = this.copyLinkToClipboard.bind( this );
		this.showPlaceholderIfEmptyString = this.showPlaceholderIfEmptyString.bind( this );

		this.state = {
			showPlaceholder: ! this.props.text,
		};
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.text !== this.props.text ) {
			this.setState( { showPlaceholder: ! this.props.text } );
		}
	}

	copyLinkToClipboard( event ) {
		const selectedText = document.getSelection().toString();
		const htmlLink = `<a href="${ this.props.href }">${ selectedText }</a>`;
		event.clipboardData.setData( 'text/plain', selectedText );
		event.clipboardData.setData( 'text/html', htmlLink );
	}

	forcePlainTextPaste( event ) {
		event.preventDefault();

		const selection = document.getSelection();
		const clipboard = event.clipboardData.getData( 'text/plain' ).replace( /[\n\r]/g, '' );
		const textNode = document.createTextNode( clipboard );

		selection.getRangeAt( 0 ).insertNode( textNode );
		selection.collapseToEnd();
	}

	showPlaceholderIfEmptyString( event ) {
		this.setState( { showPlaceholder: event.target.innerText === '' } );
	}

	render() {
		const { className, placeholder, text, href, updateFileName } = this.props;
		const { showPlaceholder } = this.state;

		return (
			<Fragment>
				<a
					aria-label={ placeholder }
					className={ `${ className }__textlink` }
					href={ href }
					onBlur={ ( event ) => updateFileName( event.target.innerText ) }
					onInput={ this.showPlaceholderIfEmptyString }
					onCopy={ this.copyLinkToClipboard }
					onCut={ this.copyLinkToClipboard }
					onPaste={ this.forcePlainTextPaste }
					contentEditable
				>
					{ text }
				</a>
				{ showPlaceholder &&
					// Disable reason: Only useful for mouse users
					/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
					<span
						className={ `${ className }__textlink-placeholder` }
						onClick={ ( event ) => event.target.previousSibling.focus() }
					>
						{ placeholder }
					</span>
					/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
				}
			</Fragment>
		);
	}
}
