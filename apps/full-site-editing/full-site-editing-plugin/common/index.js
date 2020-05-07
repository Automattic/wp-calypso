/**
 * External dependencies
 */
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { layout, plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PanelBody, Button } from '@wordpress/components';

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
				{ __( 'Block Patterns Have Moved' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				icon={ layout }
				name={ 'block-patterns-moved' }
				title={ __( 'Block Patterns Have Moved' ) }
				className="common__block-patterns-moved"
			>
				<PanelBody>
					<h2>{ __( 'Block Patterns have moved!' ) }</h2>
					<p>
						{ __(
							'You can now find them in the block inserter under the "patterns" tab.  The block inserter can be found in the top-left corner of your screen by selecting the following icon:'
						) }
					</p>
					<Button icon={ plus } onClick={ openInserter } />
				</PanelBody>
			</PluginSidebar>
		</>
	);
};

registerPlugin( 'block-patterns-moved', { render: BlockPatternsMoved } );
