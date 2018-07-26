/**
 * External dependencies
 */
import MarkdownIt from 'markdown-it';

const markdownItFull = new MarkdownIt();

const MarkdownConverter = {

	render( source ) {
		return markdownItFull.render( source );
	}

};

export default MarkdownConverter;
