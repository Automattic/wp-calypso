/**
 * External dependencies
 */
import MarkdownIt from 'markdown-it';
import { RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';

/**
 * Module variables
 */
const markdownConverter = new MarkdownIt();
const handleLinkClick = event => {
	if ( event.target.nodeName === 'A' ) {
		const hasConfirmed = window.confirm( __( 'Are you sure you wish to leave this page?' ) );

		if ( ! hasConfirmed ) {
			event.preventDefault();
		}
	}
};

export default ( { className, source = '' } ) => (
	<RawHTML className={ className } onClick={ handleLinkClick }>
		{ source.length ? markdownConverter.render( source ) : '' }
	</RawHTML>
);
