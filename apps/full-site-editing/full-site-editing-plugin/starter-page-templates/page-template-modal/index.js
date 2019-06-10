/**
 * External dependencies
 */
import { keyBy, has, map } from 'lodash';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withSelect, withDispatch } from '@wordpress/data';
import { parse as parseBlocks } from '@wordpress/blocks';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import replacePlaceholders from './utils/replace-placeholders';
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import { trackDismiss, trackView, trackSelection } from './utils/tracking';

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
	};

	constructor( props ) {
		super();
		this.state.isOpen = props.initiallyOpened;
	}

	componentDidMount() {
		if ( this.state.isOpen ) {
			trackView( this.props.vertical.id );
		}
	}

	selectTemplate = newTemplate => {
		this.setState( { isOpen: false } );
		trackSelection( this.props.vertical.id, newTemplate );

		const template = this.props.templates[ newTemplate ];

		// Skip inserting if there's nothing to insert.
		if ( ! has( template, 'content' ) ) {
			return;
		}

		const processedTemplate = {
			...template,
			title: replacePlaceholders( template.title, this.props.siteInformation ),
			content: replacePlaceholders( template.content, this.props.siteInformation ),
		};

		this.props.insertTemplate( processedTemplate );
	};

	closeModal = () => {
		this.setState( { isOpen: false } );
		trackDismiss( this.props.vertical.id );
	};

	render() {
		if ( ! this.state.isOpen ) {
			return null;
		}

		return (
			<Modal
				title={ __( 'Select Page Template', 'full-site-editing' ) }
				onRequestClose={ this.closeModal }
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
								templates={ map( this.props.templates, template => ( {
									label: template.title,
									value: template.slug,
									preview: template.preview,
									previewAlt: template.description,
								} ) ) }
								onClick={ newTemplate => this.selectTemplate( newTemplate ) }
							/>
						</fieldset>
					</form>
				</div>
			</Modal>
		);
	}
}

const PageTemplatesPlugin = compose(
	withSelect( select => ( {
		getMeta: () => select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => {
		const editorDispatcher = dispatch( 'core/editor' );
		return {
			insertTemplate: template => {
				// Set post title and remember selected template in meta.
				const currentMeta = ownProps.getMeta();
				editorDispatcher.editPost( {
					title: template.title,
					meta: {
						...currentMeta,
						_starter_page_template: template.slug,
					},
				} );

				// Insert blocks.
				const blocks = parseBlocks( template.content );
				editorDispatcher.insertBlocks( blocks );
			},
		};
	} )
)( PageTemplateModal );

// Load config passed from backend.
const { siteInformation = {}, templates = [], vertical } = window.starterPageTemplatesConfig;

registerPlugin( 'page-templates', {
	render: function() {
		return (
			<PageTemplatesPlugin
				initiallyOpened={ templates.length > 0 }
				templates={ keyBy( templates, 'slug' ) }
				vertical={ vertical }
				siteInformation={ siteInformation }
			/>
		);
	},
} );
