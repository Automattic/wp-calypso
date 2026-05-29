import { __ } from '@wordpress/i18n';
import { cancelPurchaseRoute } from '../../app/router/me';
import RouterLinkButton from '../../components/router-link-button';
import { getDeleteSiteRedirectIntent } from './delete-site-redirect';
import type { Purchase } from '@automattic/api-core';

export default function DeleteSiteRedirectButton( { purchase }: { purchase: Purchase } ) {
	const intent = getDeleteSiteRedirectIntent( purchase );

	if ( ! intent ) {
		return null;
	}

	return (
		<RouterLinkButton
			variant="secondary"
			isDestructive
			__next40pxDefaultSize
			to={ cancelPurchaseRoute.fullPath }
			params={ { purchaseId: purchase.ID } }
			search={ { intent } }
		>
			{ __( 'Delete redirect' ) }
		</RouterLinkButton>
	);
}
