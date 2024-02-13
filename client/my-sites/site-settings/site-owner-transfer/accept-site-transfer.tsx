import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import store from 'store';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import { SiteTransferringLoadingCard } from 'calypso/my-sites/site-settings/site-owner-transfer/site-transferring-loading-card';
import { acceptInvite } from 'calypso/state/invites/actions';

export function AcceptSiteTransfer( props: any ) {
	const translate = useTranslate();
	const dispatch = props.dispatch;
	const progress = 0.15;
	const [ error, setError ] = useState< string >( '' );

	const fetchAndAcceptInvite = async ( props: any ) => {
		try {
			const { siteId, inviteKey, redirectTo } = props;
			const pendingInvite = await wpcom.req.get( `/sites/${ siteId }/invites/${ inviteKey }` );
			const invite = normalizeInvite( pendingInvite );

			invite.inviteKey = inviteKey;

			await dispatch( acceptInvite( invite, null ) );

			store.set( 'accepted_site_transfer_invite', invite );
			navigate( redirectTo );
		} catch {
			setError(
				translate(
					'Failed to add you as an administrator in the site. Please contact the original site owner to invite you as administrator first.'
				)
			);
		}
	};

	useEffect( () => {
		fetchAndAcceptInvite( props );
	} );

	return (
		<SiteTransferringLoadingCard
			progress={ progress }
			error={ error }
		></SiteTransferringLoadingCard>
	);
}
