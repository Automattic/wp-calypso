/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { PostTitle } from '@wordpress/editor';

/**
 * Returns true if current page is a front (home) page and the
 * "hide_front_page_title" theme mod is on.
 *
 * @returns {boolean} homepage title visibility flag
 */
function hideHomepageTitle() {
	if ( ! window.starterPageTemplatesConfig ) {
		return false;
	}

	const { isFrontPage, hideFrontPageTitle } = window.starterPageTemplatesConfig;

	return isFrontPage && hideFrontPageTitle;
}

// Exists as a pass through component to simplify automatted testing of
// components which need to `BlockEditorProvider`. Setting up JSDom to handle
// and mock the entire Block Editor isn't useful and is difficult for testing.
// Therefore this component exists to simplify mocking out the Block Editor
// when under test conditions.
export default function( { blocks, settings, recomputeBlockListKey } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<BlockEditorProvider value={ blocks } settings={ settings }>
			<Disabled key={ recomputeBlockListKey }>
				{ ! hideHomepageTitle() && (
					<div className="block-iframe-preview__template-title">
						<PostTitle />
					</div>
				) }
				<BlockList />
			</Disabled>
		</BlockEditorProvider>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
