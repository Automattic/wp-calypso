/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PlansGridFSE from '../plans-grid-fse';
import './styles.scss';

interface Props {
	onClose: () => void;
}

const PlansModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	const header = (
		<div>
			{ /* eslint-disable @wordpress/i18n-text-domain */ }
			<h1 className="wp-brand-font">{ __( 'Choose a plan' ) }</h1>
			<p>
				{ __(
					'Pick a plan that’s right for you. There’s no risk, you can cancel for a full refund within 30 days.'
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
			{ header }
			<div className="plans-grid-container">
				<PlansGridFSE onSelect={ onClose } />
			</div>
		</Modal>
	);
};

export default PlansModal;
