import { Dialog } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './dialog.scss';

class AcceptDialog extends Component {
	static displayName = 'AcceptDialog';

	static propTypes = {
		translate: PropTypes.func,
		message: PropTypes.node,
		title: PropTypes.node,
		onClose: PropTypes.func.isRequired,
		confirmButtonText: PropTypes.node,
		cancelButtonText: PropTypes.node,
		options: PropTypes.shape( {
			isScary: PropTypes.bool,
			additionalClassNames: PropTypes.string,
			useModal: PropTypes.bool,
			modalOptions: PropTypes.object,
		} ),
	};

	state = { isVisible: true };

	onClose = ( action ) => {
		this.setState( { isVisible: false } );
		this.props.onClose( 'accept' === action );
	};

	getActionButtons = () => {
		const { options } = this.props;
		const isScary = options && options.isScary;
		const additionalClassNames = clsx( { 'is-scary': isScary } );
		return [
			{
				action: 'cancel',
				label: this.props.cancelButtonText
					? this.props.cancelButtonText
					: this.props.translate( 'Cancel' ),
				additionalClassNames: 'is-cancel',
			},
			{
				action: 'accept',
				label: this.props.confirmButtonText
					? this.props.confirmButtonText
					: this.props.translate( 'OK' ),
				isPrimary: true,
				additionalClassNames,
			},
		];
	};

	render() {
		if ( ! this.state.isVisible ) {
			return null;
		}
		if ( this.props.options?.useModal ) {
			return (
				<Modal
					title={ this.props.options?.modalOptions?.title }
					onRequestClose={ this.onClose }
					className={ clsx(
						'accept__dialog-use-modal',
						this.props?.options?.additionalClassNames
					) }
					size="medium"
				>
					{ this.props.message }
					<div className="accept__dialog-buttons">
						{ this.getActionButtons().map( ( button ) => (
							<Button
								key={ button.action }
								onClick={ () => this.onClose( button.action ) }
								variant={ button.isPrimary ? 'primary' : 'secondary' }
								className={ button.additionalClassNames }
							>
								{ button.label }
							</Button>
						) ) }
					</div>
				</Modal>
			);
		}
		return (
			<Dialog
				buttons={ this.getActionButtons() }
				onClose={ this.onClose }
				className="accept__dialog"
				isVisible
				additionalClassNames={ this.props?.options?.additionalClassNames }
			>
				{ this.props.message }
			</Dialog>
		);
	}
}

export default localize( AcceptDialog );
