/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { PageTemplatesPlugin } from '../index';
class SidebarModalOpener extends Component {
	state = {
		isWarningOpen: false,
		isOpenFromSidebar: false,
	};

	toggleTemplateModal = () => {
		this.setState( state => ( { isOpenFromSidebar: ! state.isOpenFromSidebar } ) );
	};

	toggleWarningModal = () => {
		this.setState( { isWarningOpen: ! this.state.isWarningOpen } );
	};

	render() {
		const { templates, theme, vertical, segment, hidePageTitle, isFrontPage } = this.props;
		const { isOpenFromSidebar } = this.state;

		return (
			<div className="sidebar-modal-opener">
				<Button isSecondary onClick={ this.toggleWarningModal }>
					{ __( 'Change Layout', 'full-site-editing' ) }
				</Button>

				{ isOpenFromSidebar && (
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
						isOpen={ true }
					/>
				) }

				{ this.state.isWarningOpen && (
					<Modal
						title={ __( 'Overwrite Page Content?', 'full-site-editing' ) }
						isDismissible={ false }
						onRequestClose={ this.toggleWarningModal }
						className="sidebar-modal-opener__warning-modal"
					>
						<div className="sidebar-modal-opener__warning-text">
							{ __(
								`Changing the page's layout will remove any customizations or edits you have already made.`,
								'full-site-editing'
							) }
						</div>
						<div className="sidebar-modal-opener__warning-options">
							<Button isDefault onClick={ this.toggleWarningModal }>
								{ __( 'Cancel', 'full-site-editing' ) }
							</Button>
							<Button isPrimary onClick={ this.toggleTemplateModal }>
								{ __( 'Change Layout', 'full-site-editing' ) }
							</Button>
						</div>
					</Modal>
				) }
			</div>
		);
	}
}

export default SidebarModalOpener;
