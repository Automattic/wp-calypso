/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { withDispatch } from '@wordpress/data';
import { Button, Modal } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

class SidebarModalOpener extends Component {
	state = {
		isWarningOpen: false,
	};

	openTemplateModal = () => {
		this.props.setIsOpen( true, true );
	};

	toggleWarningModal = () => {
		this.setState( ( state ) => ( {
			isWarningOpen: ! state.isWarningOpen,
		} ) );
	};

	render() {
		return (
			<div className="sidebar-modal-opener">
				<Button isSecondary onClick={ this.toggleWarningModal }>
					{ __( 'Change Layout', 'full-site-editing' ) }
				</Button>

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
							<Button isPrimary onClick={ this.openTemplateModal }>
								{ __( 'Change Layout', 'full-site-editing' ) }
							</Button>
						</div>
					</Modal>
				) }
			</div>
		);
	}
}

const SidebarTemplatesPlugin = compose(
	withDispatch( ( dispatch ) => ( {
		setIsOpen: dispatch( 'automattic/starter-page-layouts' ).setIsOpen,
	} ) )
)( SidebarModalOpener );

export default SidebarTemplatesPlugin;
