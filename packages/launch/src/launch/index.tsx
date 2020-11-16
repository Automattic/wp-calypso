/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FocusedLaunch from '../focused-launch';
import LaunchContext from '../context';
import { useFocusedLaunchModal } from '../hooks';
import './styles.scss';

interface Props {
	onClose: () => void;
	siteId: number;
	locale: string;
	redirectTo?: ( url: string ) => void;
}

const FocusedLaunchModal: React.FunctionComponent< Props > = ( {
	onClose,
	siteId,
	locale,
	redirectTo = ( url: string ) => {
		// Won't work if trying to redirect the parent frame
		window.location.href = url;
	},
} ) => {
	const {
		isModalDismissible,
		setModalDismissible,
		isModalTitleVisible,
		showModalTitle,
	} = useFocusedLaunchModal();

	// Make sure the modal is dimissible when launched.
	useEffect( () => {
		setModalDismissible();
	}, [ setModalDismissible ] );

	// Make sure the modal title is visible when launched.
	useEffect( () => {
		showModalTitle();
	}, [ showModalTitle ] );

	return (
		<Modal
			open={ true }
			className={ classNames( 'launch__focused-modal', {
				'launch__focused-modal--hide-title': ! isModalTitleVisible,
			} ) }
			overlayClassName="launch__focused-modal-overlay"
			bodyOpenClassName="has-focused-launch-modal"
			onRequestClose={ onClose }
			title={ __( 'Complete setup', __i18n_text_domain__ ) }
			icon={ <Icon icon={ wordpress } size={ 36 } /> }
			isDismissible={ isModalDismissible }
		>
			<div className="launch__focused-modal-wrapper ">
				<div className="launch__focused-modal-body">
					<LaunchContext.Provider value={ { siteId, locale, redirectTo } }>
						<FocusedLaunch />
					</LaunchContext.Provider>
				</div>
			</div>
		</Modal>
	);
};

export default FocusedLaunchModal;
