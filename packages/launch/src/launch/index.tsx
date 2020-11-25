/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import classNames from 'classnames';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import FocusedLaunch from '../focused-launch';
import LaunchContext from '../context';
import { LAUNCH_STORE } from '../stores';
import { FOCUSED_LAUNCH_FLOW_ID } from '../constants';
import './styles.scss';

interface Props {
	siteId: number;
	locale: string;
	redirectTo?: ( url: string ) => void;
	openCheckout: ( siteId: number | string, isEcommerce?: boolean ) => void;
}

const FocusedLaunchModal: React.FunctionComponent< Props > = ( {
	siteId,
	locale,
	redirectTo = ( url: string ) => {
		// Won't work if trying to redirect the parent frame
		window.location.href = url;
	},
	openCheckout,
} ) => {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );
	const isModalTitleVisible = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isModalTitleVisible()
	);

	const { closeFocusedLaunch } = useDispatch( LAUNCH_STORE );

	return (
		<Modal
			open={ true }
			className={ classNames( 'launch__focused-modal', {
				'launch__focused-modal--hide-title': ! isModalTitleVisible,
			} ) }
			overlayClassName="launch__focused-modal-overlay"
			bodyOpenClassName="has-focused-launch-modal"
			onRequestClose={ closeFocusedLaunch }
			title={ __( 'Complete setup', __i18n_text_domain__ ) }
			icon={ <Icon icon={ wordpress } size={ 36 } /> }
			isDismissible={ isModalDismissible }
			shouldCloseOnEsc={ isModalDismissible }
			shouldCloseOnClickOutside={ isModalDismissible }
		>
			<div className="launch__focused-modal-body">
				<LaunchContext.Provider
					value={ { siteId, locale, redirectTo, openCheckout, flow: FOCUSED_LAUNCH_FLOW_ID } }
				>
					<FocusedLaunch />
				</LaunchContext.Provider>
			</div>
		</Modal>
	);
};

export default FocusedLaunchModal;
