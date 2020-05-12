/**
 * External dependencies
 */
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { layout, plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PanelBody, Button } from '@wordpress/components';
import { __experimentalLibrary } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import './index.scss';

const BlockPatternsMoved = () => {
	const openInserter = () => {
		const inserterButton = document.querySelector( '.edit-post-header-toolbar__inserter-toggle' );
		inserterButton && inserterButton.click();
		setTimeout( () => {
			const patternsButton = document.querySelector(
				'.block-editor-inserter__tabs [id$="patterns"]'
			);
			patternsButton && patternsButton.click();
		}, 300 );
	};

	return (
		<>
			<PluginSidebarMoreMenuItem icon={ layout } target="block-patterns-moved">
				{ __( 'Block Patterns', 'full-site-editing' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				icon={ layout }
				name={ 'block-patterns-moved' }
				title={ __( 'Block Patterns', 'full-site-editing' ) }
				className="common__block-patterns-moved"
			>
				<PanelBody>
					<h2>{ __( 'Block Patterns', 'full-site-editing' ) }</h2>
					<p>
						{ __(
							'Block Patterns have moved. You can now find them in the block inserter under the "patterns" tab.',
							'full-site-editing'
						) }
					</p>
					<p>
						{ __(
							'The block inserter can be found in the top-left corner of your screen by selecting the following icon:',
							'full-site-editing'
						) }
					</p>
					<Button isPrimary icon={ plus } onClick={ openInserter } />
				</PanelBody>
			</PluginSidebar>
		</>
	);
};

// Gutenberg 8 includes `Library` as `@wordpres/block-editor` experimental export.
// The experimental Library component contains the patterns in their new location.
if ( typeof __experimentalLibrary !== 'undefined' ) {
	registerPlugin( 'block-patterns-moved', { render: BlockPatternsMoved } );
}
