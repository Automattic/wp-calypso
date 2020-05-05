/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
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
		isWarningOpen: false,
	};

	toggleTemplateModal = () => {
		this.props.setIsOpen( ! this.props.isOpen );
	};

	toggleWarningModal = () => {
		this.setState( { isWarningOpen: ! this.state.isWarningOpen } );
	};

	getLastTemplateUsed = () => {
		const { isFrontPage, templates, theme } = this.props;
		let { lastTemplateUsedSlug } = this.props;
		// Try to match the homepage of the theme. Note that as folks transition
		// to using the slug-based version of the homepage (e.g. "shawburn"), the
		// slug will work normally without going through this check.
		if ( ! lastTemplateUsedSlug && isFrontPage ) {
			lastTemplateUsedSlug = theme;
		}

		if ( ! lastTemplateUsedSlug || lastTemplateUsedSlug === 'blank' ) {
			// If no template used or 'blank', preview any other template (1 is currently 'Home' template).
			return templates[ 0 ];
		}
		const matchingTemplate = templates.find( ( temp ) => temp.slug === lastTemplateUsedSlug );
		// If no matching template, return the blank template.
		if ( ! matchingTemplate ) {
			return templates[ 0 ];
		}
		return matchingTemplate;
	};

	render() {
		const { slug, title, preview, previewAlt } = this.getLastTemplateUsed();
		const {
			templates,
			theme,
			vertical,
			segment,
			siteInformation,
			hidePageTitle,
			isFrontPage,
			isOpen,
		} = this.props;

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

				{ isOpen && (
					<PageTemplatesPlugin
						shouldPrefetchAssets={ false }
						templates={ templates }
						theme={ theme }
						vertical={ vertical }
						segment={ segment }
						toggleTemplateModal={ this.toggleTemplateModal }
						hidePageTitle={ hidePageTitle }
						isFrontPage={ isFrontPage }
						isPromptedFromSidebar
					/>
				) }

				{ this.state.isWarningOpen && (
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
				) }
			</div>
		);
	}
}

const SidebarTemplatesPlugin = compose(
	withSelect( ( select ) => ( {
		lastTemplateUsedSlug: select( 'core/editor' ).getEditedPostAttribute( 'meta' )
			._starter_page_template,
		isOpen: select( 'automattic/starter-page-layouts' ).isOpen(),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		setIsOpen: dispatch( 'automattic/starter-page-layouts' ).setIsOpen,
	} ) )
)( SidebarModalOpener );

export default SidebarTemplatesPlugin;
