/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PlansGrid, { Props as PlansGridProps } from '@automattic/plans-grid';
import './styles.scss';

interface Props extends Omit< PlansGridProps, 'header' > {
	isOpen: boolean;
	onClose: () => void;
}

const PlansModal: React.FunctionComponent< Props > = ( { isOpen, onClose, ...props } ) => {
	if ( ! isOpen ) {
		return null;
	}

	const header = (
		<div>
			{ /* eslint-disable @wordpress/i18n-text-domain */ }
			<h1 className="wp-brand-font">{ __( 'Choose a plan' ) }</h1>
			<p>
				{ __(
					'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.'
				) }
			</p>
		</div>
	);

	return (
		<Modal
			className="plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
			onRequestClose={ onClose }
			title=""
		>
			<div className="plans-grid-container">
				<PlansGrid header={ header } { ...props } />
			</div>
		</Modal>
	);
};

export default PlansModal;
