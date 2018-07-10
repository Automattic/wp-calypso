/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { count as wordCount } from '@wordpress/wordcount';

function WordCount( { content } ) {
	return (
		<span className="word-count">{ wordCount( content, 'words' ) }</span>
	);
}

export default withSelect( ( select ) => {
	return {
		content: select( 'core/editor' ).getEditedPostAttribute( 'content' ),
	};
} )( WordCount );
