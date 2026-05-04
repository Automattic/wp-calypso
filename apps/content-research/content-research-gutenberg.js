import ContentResearchSidebar from '@automattic/content-research';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import './content-research.scss';

const queryClient = new QueryClient();

const SIDEBAR_ID = 'content-research/content-research-sidebar';

function ContentResearchPlugin() {
	return (
		<>
			<PluginSidebarMoreMenuItem target="content-research-sidebar" icon={ search }>
				{ __( 'Content Research', 'content-research' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="content-research-sidebar"
				title={ __( 'Content Research', 'content-research' ) }
				icon={ search }
			>
				<QueryClientProvider client={ queryClient }>
					<ContentResearchSidebar />
				</QueryClientProvider>
			</PluginSidebar>
		</>
	);
}

/**
 * "Need inspiration?" prompt on empty posts.
 *
 * Shows a subtle link below the default empty paragraph block
 * when the post has no title and no content, guiding users
 * to open the Content Research sidebar.
 */
function isContentEmpty( content ) {
	if ( ! content ) {
		return true;
	}
	if ( typeof content === 'string' ) {
		return content === '';
	}
	// RichText value object — check the text property or length.
	if ( typeof content === 'object' && typeof content.text === 'string' ) {
		return content.text === '';
	}
	if ( typeof content === 'object' && typeof content.length === 'number' ) {
		return content.length === 0;
	}
	return false;
}

function ParagraphWithInspirationPrompt( { BlockEdit, ...props } ) {
	const { isFirstBlock, isEmptyPost } = useSelect(
		( select ) => {
			const editor = select( 'core/editor' );
			const blockEditor = select( 'core/block-editor' );
			const blocks = blockEditor.getBlocks();
			const title = editor.getEditedPostAttribute( 'title' ) || '';
			const isFirst = blocks.length <= 1 && blocks[ 0 ]?.clientId === props.clientId;
			const isEmpty =
				title.trim() === '' && blocks.length <= 1 && isContentEmpty( props.attributes.content );

			return {
				isFirstBlock: isFirst,
				isEmptyPost: isEmpty,
			};
		},
		[ props.clientId, props.attributes.content ]
	);

	const { openGeneralSidebar } = useDispatch( 'core/edit-post' );

	if ( ! isFirstBlock || ! isEmptyPost ) {
		return <BlockEdit { ...props } />;
	}

	return (
		<div style={ { position: 'relative' } }>
			<BlockEdit { ...props } />
			<button
				className="content-research-inspiration-prompt"
				onClick={ ( e ) => {
					e.stopPropagation();
					openGeneralSidebar( SIDEBAR_ID );
				} }
				style={ {
					position: 'absolute',
					top: 0,
					left: '190px',
					padding: 0,
					border: 'none',
					background: 'none',
					fontSize: 'inherit',
					fontFamily: 'inherit',
					color: '#949494',
					cursor: 'pointer',
					whiteSpace: 'nowrap',
					lineHeight: 'inherit',
				} }
				onMouseEnter={ ( e ) => ( e.target.style.color = '#3858e9' ) }
				onMouseLeave={ ( e ) => ( e.target.style.color = '#949494' ) }
			>
				{ __( '— Need inspiration?', 'content-research' ) }
			</button>
		</div>
	);
}

const withInspirationPrompt = createHigherOrderComponent( ( BlockEdit ) => {
	return function InspirationPromptBlockEdit( props ) {
		if ( props.name !== 'core/paragraph' ) {
			return <BlockEdit { ...props } />;
		}
		return <ParagraphWithInspirationPrompt BlockEdit={ BlockEdit } { ...props } />;
	};
}, 'withInspirationPrompt' );

addFilter( 'editor.BlockEdit', 'content-research/inspiration-prompt', withInspirationPrompt );

registerPlugin( 'content-research', {
	render: () => <ContentResearchPlugin />,
} );
