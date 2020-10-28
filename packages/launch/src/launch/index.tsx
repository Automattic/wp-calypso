/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import FocusedLaunch from '../focused-launch';

import './styles.scss';

interface Props {
	onClose: () => void;
}

const FocusedLaunchModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	return (
		<Modal
			open={ true }
			className="launch__focused-modal"
			overlayClassName="launch__focused-modal-overlay"
			bodyOpenClassName="has-focused-launch-modal"
			onRequestClose={ onClose }
			title={ __( 'Complete setup' ) }
			// remove the wrong type when https://github.com/DefinitelyTyped/DefinitelyTyped/pull/49156 is merged
			icon={
				( ( <Icon icon={ wordpress } size={ 36 } /> ) as unknown ) as React.FunctionComponent<
					unknown
				>
			}
		>
			<>
				<div className="launch__focused-modal-wrapper ">
					<div className="launch__focused-modal-body">
						<FocusedLaunch />
					</div>
				</div>
			</>
		</Modal>
	);
};

export default FocusedLaunchModal;
