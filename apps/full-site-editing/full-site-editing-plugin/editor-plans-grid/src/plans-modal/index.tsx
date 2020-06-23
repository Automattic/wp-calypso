/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PlansGrid, { Props as PlansGridProps } from '@automattic/plans-grid';
import './styles.scss';

interface Props extends PlansGridProps {
	isOpen: boolean;
	onClose: () => void;
}

const PlansModal: React.FunctionComponent< Props > = ( { isOpen, onClose, domain, plan } ) => {
	if ( ! isOpen ) {
		return null;
	}

	const header = <div>Plans Grid</div>;

	return (
		<Modal
			className="plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
			onRequestClose={ onClose }
			title=""
		>
			<PlansGrid currentDomain={ domain } header={ header } currentPlan={ plan } />
		</Modal>
	);
};

export default PlansModal;
