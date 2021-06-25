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
import Success from '../focused-launch/success';
import LaunchContext, { LaunchContextProps } from '../context';
import { LAUNCH_STORE, SITE_STORE } from '../stores';
import { FOCUSED_LAUNCH_FLOW_ID } from '../constants';
import './styles.scss';

interface FocusedLaunchModalProps extends Omit< LaunchContextProps, 'flow' > {
	locale?: string;
	isInIframe: boolean;
	isLaunchImmediately: boolean;
}

const FocusedLaunchModal: React.FunctionComponent< FocusedLaunchModalProps > = ( {
	locale = 'en',
	siteId,
	openCheckout,
	redirectTo,
	getCurrentLaunchFlowUrl,
	isInIframe,
	isLaunchImmediately,
} ) => {
	const { isModalDismissible, isModalTitleVisible } = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getState()
	);
	const { launchSite } = useDispatch( SITE_STORE );

	const { closeFocusedLaunch, unsetPlanProductId } = useDispatch( LAUNCH_STORE );

	React.useEffect( () => {
		if ( isLaunchImmediately ) {
			// This happens when the user enters the block editor again after
			// checkout redirection (i.e. when in Calypso, paying with paypal).
			// If there was a plan in cart before redirect to payment processing,
			// remove it now since we don't need to reload the page when dismissing Success view
			// Calling `unsetPlanProductId()` won't be needed after
			// https://github.com/Automattic/wp-calypso/issues/50185 is fixed.
			unsetPlanProductId();
			launchSite( siteId );
		}
	}, [ isLaunchImmediately, unsetPlanProductId, launchSite, siteId ] );

	return (
		<LocaleProvider localeSlug={ locale }>
			<Modal
				open={ true }
				className={ classNames( 'launch__focused-modal', {
					'launch__focused-modal--hide-title': ! isModalTitleVisible,
				} ) }
				bodyOpenClassName="has-focused-launch-modal"
				overlayClassName={ classNames( 'launch__focused-modal-overlay', {
					'launch__focused-modal-overlay--delay-animation-in': isLaunchImmediately,
				} ) }
				onRequestClose={ closeFocusedLaunch }
				title={ __( 'Complete setup', __i18n_text_domain__ ) }
				icon={ <Icon icon={ wordpress } size={ 36 } /> }
				isDismissible={ isModalDismissible }
				shouldCloseOnEsc={ isModalDismissible }
				shouldCloseOnClickOutside={ isModalDismissible }
			>
				<div className="launch__focused-modal-body">
					<LaunchContext.Provider
						value={ {
							siteId,
							redirectTo,
							openCheckout,
							flow: FOCUSED_LAUNCH_FLOW_ID,
							getCurrentLaunchFlowUrl,
							isInIframe,
						} }
					>
						{ isLaunchImmediately ? <Success /> : <FocusedLaunch /> }
					</LaunchContext.Provider>
				</div>
			</Modal>
		</LocaleProvider>
	);
};

export default FocusedLaunchModal;
