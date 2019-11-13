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

class SidebarModalOpener extends Component {
	state = {
		isTemplateModalOpen: false,
		isWarningOpen: false,
	};

	toggleTemplateModal = () => {
		this.setState( { isTemplateModalOpen: ! this.state.isTemplateModalOpen } );
	};

	toggleWarningModal = () => {
		this.setState( { isWarningOpen: ! this.state.isWarningOpen } );
	};

	getLastTemplateUsed = ( { templateUsedSlug, templates } = this.props ) => {
		if ( ! templateUsedSlug || templateUsedSlug === 'blank' ) {
			// If no template used or 'blank', preview any other template (1 is currently 'Home' template).
			return templates[ 1 ];
		}
		return templates.find( temp => temp.slug === templateUsedSlug );
	};

	render() {
		const { slug, title, preview, previewAlt } = this.getLastTemplateUsed();
		const { templates, vertical, segment, siteInformation } = this.props;

		return (
			<div className="sidebar-modal-opener">
				<TemplateSelectorItem
					id="sidebar-modal-opener__last-template-used-preview"
					value={ slug }
					label={ replacePlaceholders( title, siteInformation ) }
					staticPreviewImg={ preview }
					staticPreviewImgAlt={ previewAlt }
					onSelect={ this.toggleWarningModal }
				/>

				<Button
					isPrimary
					onClick={ this.toggleWarningModal }
					className="sidebar-modal-opener__button"
				>
					{ __( 'Change Layout' ) }
				</Button>

				{ this.state.isTemplateModalOpen ? (
					<PageTemplatesPlugin
						shouldPrefetchAssets={ false }
						templates={ templates }
						vertical={ vertical }
						segment={ segment }
						toggleTemplateModal={ this.toggleTemplateModal }
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
							<Button isPrimary onClick={ this.toggleTemplateModal }>
								{ __( 'Change Layout' ) }
							</Button>
						</div>
					</Modal>
				) : null }
			</div>
		);
	}
}

const SidebarTemplatesPlugin = compose(
	withSelect( select => ( {
		templateUsedSlug: select( 'core/editor' ).getEditedPostAttribute( 'meta' )
			._starter_page_template,
	} ) )
)( SidebarModalOpener );

export default SidebarTemplatesPlugin;
