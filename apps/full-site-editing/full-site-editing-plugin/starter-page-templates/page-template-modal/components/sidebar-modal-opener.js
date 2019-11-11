/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { Button, Modal } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { PageTemplatesPlugin } from '../index';
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';
/* eslint-enable import/no-extraneous-dependencies */

export class SidebarTemplateOpener extends Component {
	state = {
		isTemplateModalOpen: false,
		isWarningOpen: false,
	};

	togglePlugin = () => {
		this.setState( {
			isTemplateModalOpen: ! this.state.isTemplateModalOpen,
			isWarningOpen: false,
		} );
	};

	toggleWarningModal = () => {
		this.setState( { isWarningOpen: ! this.state.isWarningOpen } );
	};

	getTemplateUsed = () => {
		if ( ! this.props.templateUsedSlug || this.props.templateUsedSlug === 'blank' ) {
			return this.props.templates[ 1 ];
		}
		return this.props.templates.filter( temp => temp.slug === this.props.templateUsedSlug )[ 0 ];
	};

	render() {
		const { slug, title, preview, previewAlt } = this.getTemplateUsed();
		const { templates, vertical, segment, siteInformation } = this.props;

		return (
			<div className="sidebar-modal-opener">
				{ this.state.isTemplateModalOpen ? (
					<PageTemplatesPlugin
						shouldPrefetchAssets={ false }
						templates={ templates }
						vertical={ vertical }
						segment={ segment }
						togglePlugin={ this.togglePlugin }
						isPromptedFromSidebar
					/>
				) : null }
				{ this.state.isWarningOpen ? (
					<Modal
						title={ __( 'Overwrite Page Content?' ) }
						isDismissible={ false }
						onRequestClose={ this.toggleWarningModal }
						className="sidebar-modal-opener__warning-modal"
					>
						<div className="sidebar-modal-opener__warning-text">
							{ __(
								`Changing the page's layout will remove any customizations or edits you have already made.`
							) }
						</div>
						<div className="sidebar-modal-opener__warning-options">
							<Button isDefault onClick={ this.toggleWarningModal }>
								{ __( 'Cancel' ) }
							</Button>
							<Button isPrimary onClick={ this.togglePlugin }>
								{ __( 'Change Layout' ) }
							</Button>
						</div>
					</Modal>
				) : null }

				<TemplateSelectorItem
					id="sidebar-modal-opener__template-preview"
					value={ slug }
					label={ replacePlaceholders( title, siteInformation ) }
					staticPreviewImg={ preview }
					staticPreviewImgAlt={ previewAlt }
				/>

				<Button
					isPrimary
					onClick={ this.toggleWarningModal }
					className="sidebar-modal-opener__button"
				>
					{ __( 'Change Layout' ) }
				</Button>
			</div>
		);
	}
}

const SidebarTemplatesPlugin = compose(
	withSelect( select => ( {
		templateUsedSlug: select( 'core/editor' ).getEditedPostAttribute( 'meta' )
			._starter_page_template,
	} ) )
)( SidebarTemplateOpener );

export default SidebarTemplatesPlugin;
