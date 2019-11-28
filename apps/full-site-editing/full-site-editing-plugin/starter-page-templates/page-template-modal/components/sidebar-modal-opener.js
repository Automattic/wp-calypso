/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { PageTemplatesPlugin, LastTemplateUsed } from '../index';
import '../../../../../../client/landing/gutenboarding/stores/verticals-templates'; // Should be @automattic/stores/vertical-templates
/* eslint-enable import/no-extraneous-dependencies */

class SidebarTemplatesPlugin extends Component {
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

	render() {
		const { isFrontPage, theme, vertical, segment, siteInformation } = this.props;

		return (
			<div className="sidebar-modal-opener">
				<LastTemplateUsed siteInformation={ siteInformation } />
				<Button
					isPrimary
					onClick={ this.toggleWarningModal }
					className="sidebar-modal-opener__button"
				>
					{ __( 'Change Layout' ) }
				</Button>

				{ this.state.isTemplateModalOpen && (
					<PageTemplatesPlugin
						shouldPrefetchAssets={ false }
						theme={ theme }
						vertical={ vertical }
						segment={ segment }
						toggleTemplateModal={ this.toggleTemplateModal }
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

export default SidebarTemplatesPlugin;
