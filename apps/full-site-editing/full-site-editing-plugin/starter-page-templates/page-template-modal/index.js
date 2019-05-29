/**
 * External dependencies
 */
import { keyBy, map, has } from 'lodash';
import { __ } from '@wordpress/i18n';
import { withState } from '@wordpress/compose';
import { Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { dispatch } from '@wordpress/data';
import { parse as parseBlocks } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';

// TODO: remove once we have proper previews from API
if ( window.starterPageTemplatesConfig ) {
	const PREVIEWS_BY_SLUG = {
		home: {
			src: 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-home-2.png',
			alt:
				'Full width hero banner, followed by alternating text and image sections, followed by a Get in Touch area',
		},
		menu: {
			src: 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-menu-2.png',
			alt: '',
		},
		'contact-us': {
			src:
				'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-contactus-2.png',
			alt: '',
		},
	};
	window.starterPageTemplatesConfig.templates = map(
		window.starterPageTemplatesConfig.templates,
		template => {
			template.preview = PREVIEWS_BY_SLUG[ template.slug ];
			return template;
		}
	);
}

const { siteInformation = {}, templates = [] } = window.starterPageTemplatesConfig;
const editorDispatcher = dispatch( 'core/editor' );

const insertTemplate = template => {
	// Skip inserting if there's nothing to insert.
	if ( ! has( template, 'content' ) ) {
		return;
	}

	// set title
	editorDispatcher.editPost( { title: replacePlaceholders( template.title, siteInformation ) } );

	// load content
	const templateString = replacePlaceholders( template.content, siteInformation );
	const blocks = parseBlocks( templateString );
	editorDispatcher.insertBlocks( blocks );
};

const PageTemplateModal = withState( {
	isOpen: true,
	isLoading: false,
	verticalTemplates: keyBy( templates, 'slug' ),
} )( ( { isOpen, verticalTemplates, setState } ) => (
	<div>
		{ isOpen && (
			<Modal
				title={ __( 'Select Page Template', 'full-site-editing' ) }
				onRequestClose={ () => setState( { isOpen: false } ) }
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
								onClick={ newTemplate => {
									setState( { isOpen: false } );
									insertTemplate( verticalTemplates[ newTemplate ] );
								} }
							/>
						</fieldset>
					</form>
				</div>
			</Modal>
		) }
	</div>
) );

registerPlugin( 'page-templates', {
	render: function() {
		return <PageTemplateModal />;
	},
} );
