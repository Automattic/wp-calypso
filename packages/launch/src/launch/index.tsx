/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { LocaleProvider } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import FocusedLaunch from '../focused-launch';
import LaunchContext from '../context';
import { LAUNCH_STORE } from '../stores';
import { FOCUSED_LAUNCH_FLOW_ID } from '../constants';
import './styles.scss';

interface Props {
	locale?: string;
	siteId: number;
	openCheckout: ( siteId: number, isEcommerce?: boolean ) => void;
	redirectTo: ( path: string ) => void;
}

const FocusedLaunchModal: React.FunctionComponent< Props > = ( {
	locale = 'en',
	siteId,
	openCheckout,
	redirectTo,
} ) => {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );
	const isModalTitleVisible = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isModalTitleVisible()
	);

	const { closeFocusedLaunch } = useDispatch( LAUNCH_STORE );

	return (
		<LocaleProvider localeSlug={ locale }>
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
						value={ { siteId, redirectTo, openCheckout, flow: FOCUSED_LAUNCH_FLOW_ID } }
					>
						<FocusedLaunch />
					</LaunchContext.Provider>
				</div>
			</Modal>
		</LocaleProvider>
	);
};

export default FocusedLaunchModal;
