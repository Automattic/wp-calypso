/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import WordCount from '../word-count';
import DocumentOutline from '../document-outline';

function TableOfContentsPanel( { headingCount, paragraphCount, numberOfBlocks } ) {
	return (
		<Fragment>
			<div
				className="table-of-contents__counts"
				role="note"
				aria-label={ __( 'Document Statistics' ) }
				tabIndex="0"
			>
				<div className="table-of-contents__count">
					{ __( 'Words' ) }
					<WordCount />
				</div>
				<div className="table-of-contents__count">
					{ __( 'Headings' ) }
					<span className="table-of-contents__number">
						{ headingCount }
					</span>
				</div>
				<div className="table-of-contents__count">
					{ __( 'Paragraphs' ) }
					<span className="table-of-contents__number">
						{ paragraphCount }
					</span>
				</div>
				<div className="table-of-contents__count">
					{ __( 'Blocks' ) }
					<span className="table-of-contents__number">
						{ numberOfBlocks }
					</span>
				</div>
			</div>
			{ headingCount > 0 && (
				<Fragment>
					<hr />
					<span className="table-of-contents__title">
						{ __( 'Document Outline' ) }
					</span>
					<DocumentOutline />
				</Fragment>
			) }
		</Fragment>
	);
}

export default withSelect( ( select ) => {
	const { getGlobalBlockCount } = select( 'core/editor' );
	return {
		headingCount: getGlobalBlockCount( 'core/heading' ),
		paragraphCount: getGlobalBlockCount( 'core/paragraph' ),
		numberOfBlocks: getGlobalBlockCount(),
	};
} )( TableOfContentsPanel );
