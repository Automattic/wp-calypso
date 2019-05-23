/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import { keyBy } from 'lodash';

( function( wp, config = {} ) {
	const registerPlugin = wp.plugins.registerPlugin;
	const { Modal, Button } = wp.components;
	const { withState } = wp.compose;

	const { siteInformation = {}, templates = [] } = config;

	const insertTemplate = template => {
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
		selectedTemplate: 'home',
		verticalTemplates: keyBy( templates, 'slug' ),
	} )( ( { isOpen, selectedTemplate, verticalTemplates, setState } ) => (
		<div>
			{ isOpen && (
				<Modal
					title="Select Page Template"
					onRequestClose={ () => setState( { isOpen: false } ) }
					className="page-template-modal"
				>
					<div className="page-template-modal__inner">
						<div className="page-template-modal__intro">
							<p>Pick a Template that matches the purpose of your page.</p>
							<p>You can customise each Template to meet your needs.</p>
						</div>
						<form className="page-template-modal__form">
							<fieldset className="page-template-modal__list">
								<TemplateSelectorControl
									label="Template"
									selected={ selectedTemplate }
									templates={ Object.values( verticalTemplates ).map( template => ( {
										label: template.title,
										value: template.slug,
										preview: template.preview,
									} ) ) }
									onChange={ newTemplate => {
										setState( { selectedTemplate: newTemplate } );
									} }
								/>
							</fieldset>
							<div class="page-template-modal__actions">
								<Button
									className="page-template-modal__action page-template-modal__action-use"
									isPrimary
									isLarge
									onClick={ () => {
										setState( { isOpen: false } );
										insertTemplate( verticalTemplates[ selectedTemplate ] );
									} }
								>
									Use Template
								</Button>
								or
								<Button
									className="page-template-modal__action"
									isLink
									isLarge
									onClick={ () => setState( { isOpen: false } ) }
								>
									Start with blank page
								</Button>
							</div>
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
