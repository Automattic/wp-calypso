/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import { keyBy, map, has } from 'lodash';

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

( function( wp, config = {} ) {
	const registerPlugin = wp.plugins.registerPlugin;
	const { Modal } = wp.components;
	const { withState } = wp.compose;

	const { siteInformation = {}, templates = [] } = config;

	const insertTemplate = template => {
		// Skip inserting if there's nothing to insert.
		if ( ! has( template, 'content' ) ) {
			return;
		}

		// set title
		wp.data
			.dispatch( 'core/editor' )
			.editPost( { title: replacePlaceholders( template.title, siteInformation ) } );

		// load content
		const templateString = replacePlaceholders( template.content, siteInformation );
		const blocks = wp.blocks.parse( templateString );
		wp.data.dispatch( 'core/editor' ).insertBlocks( blocks );
	};

	const PageTemplateModal = withState( {
		isOpen: true,
		isLoading: false,
		verticalTemplates: keyBy( templates, 'slug' ),
	} )( ( { isOpen, verticalTemplates, setState } ) => (
		<div>
			{ isOpen && (
				<Modal
					title="Select Page Template"
					onRequestClose={ () => setState( { isOpen: false } ) }
					className="page-template-modal"
				>
					<div className="page-template-modal__inner">
						<form className="page-template-modal__form">
							<fieldset className="page-template-modal__list">
								<legend className="page-template-modal__intro">
									<p>Pick a Template that matches the purpose of your page.</p>
									<p>You can customise each Template to meet your needs.</p>
								</legend>
								<TemplateSelectorControl
									label="Template"
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
} )( window.wp, window.starterPageTemplatesConfig );
