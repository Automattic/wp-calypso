/**
 * External dependencies
 */
import { keyBy, has } from 'lodash';
import { __ } from '@wordpress/i18n';
import { withState } from '@wordpress/compose';
import { Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { dispatch, select } from '@wordpress/data';
import { parse as parseBlocks } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import { trackDismiss, trackView, trackSelection } from './utils/tracking';

const { siteInformation = {}, templates = [], vertical } = window.starterPageTemplatesConfig;
const editorDispatcher = dispatch( 'core/editor' );
const editorSelector = select( 'core/editor' );

const insertTemplate = template => {
	// Skip inserting if there's nothing to insert.
	if ( ! has( template, 'content' ) ) {
		return;
	}

	// Set post title and remember selected template in meta.
	const currentMeta = editorSelector.getEditedPostAttribute( 'meta' );
	editorDispatcher.editPost( {
		title: replacePlaceholders( template.title, siteInformation ),
		meta: {
			...currentMeta,
			_starter_page_template: template.slug,
		},
	} );

	// Insert blocks.
	const templateString = replacePlaceholders( template.content, siteInformation );
	const blocks = parseBlocks( templateString );
	editorDispatcher.insertBlocks( blocks );
};

const PageTemplateModal = withState( {
	isOpen: true,
	isLoading: false,
	verticalTemplates: keyBy( templates, 'slug' ),
} )( ( { isOpen, verticalTemplates, setState } ) => {
	const closeModal = () => {
		setState( { isOpen: false } );
		trackDismiss( vertical.id );
	};
	const selectTemplate = newTemplate => {
		insertTemplate( verticalTemplates[ newTemplate ] );
		setState( { isOpen: false } );
		trackSelection( vertical.id, newTemplate );
	};
	return (
		<div>
			{ isOpen && (
				<Modal
					title={ __( 'Select Page Template', 'full-site-editing' ) }
					onRequestClose={ closeModal }
					className="page-template-modal"
				>
					<div className="page-template-modal__inner">
						<form className="page-template-modal__form">
							<fieldset className="page-template-modal__list">
								<legend className="page-template-modal__intro">
									<p>
										{ __(
											'Pick a Template that matches the purpose of your page.',
											'full-site-editing'
										) }
									</p>
									<p>
										{ __(
											'You can customize each Template to meet your needs.',
											'full-site-editing'
										) }
									</p>
								</legend>
								<TemplateSelectorControl
									label={ __( 'Template', 'full-site-editing' ) }
									templates={ Object.values( verticalTemplates ).map( template => ( {
										label: template.title,
										value: template.slug,
										preview: template.preview && template.preview.src,
										previewAlt: template.preview && template.preview.alt,
									} ) ) }
									onClick={ newTemplate => selectTemplate( newTemplate ) }
								/>
							</fieldset>
						</form>
					</div>
				</Modal>
			) }
		</div>
	);
} );

registerPlugin( 'page-templates', {
	render: function() {
		return <PageTemplateModal />;
	},
} );

trackView( vertical.id );
