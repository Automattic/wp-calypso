/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION } from '@automattic/calypso-products';
import { isJetpackMinimumVersion } from 'calypso/state/sites/selectors';
import { resetCheckoutRedirectProduct } from 'calypso/state/ui/checkout/actions';
import { getCheckoutRedirectProduct } from 'calypso/state/ui/checkout/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const LegacyPlanDialog: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId );
	const redirectProduct = useSelector( getCheckoutRedirectProduct );
	const isMinimumVersion = useSelector(
		( state ) =>
			siteId && isJetpackMinimumVersion( state, siteId, JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION )
	);

	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isVisible, setVisible ] = useState( !! redirectProduct );

	const onClose = useCallback( () => setVisible( false ), [ setVisible ] );
	const onAfterClose = useCallback( () => dispatch( resetCheckoutRedirectProduct() ), [
		dispatch,
	] );

	const versionMessage = isMinimumVersion
		? `Is ${ JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION } or above`
		: `Is below ${ JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION }`;

	return (
		<Dialog
			isVisible={ isVisible }
			buttons={ [ { action: 'close', label: translate( 'I understand' ) } ] }
			onClose={ onClose }
			onAfterClose={ onAfterClose }
		>
			<h1>{ translate( 'Plan not found' ) }</h1>
			<p>{ `The plan you're trying to buy (${ redirectProduct }) is not available.` }</p>
			{ typeof isMinimumVersion === 'boolean' ? versionMessage : null }
		</Dialog>
	);
};

export default LegacyPlanDialog;
