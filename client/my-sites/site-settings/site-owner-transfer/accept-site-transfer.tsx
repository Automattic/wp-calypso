/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { navigate } from 'calypso/lib/navigate';
import { acceptInvite } from 'calypso/state/invites/actions';
import { useEffect } from '@wordpress/element';
import wpcom from 'calypso/lib/wp';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import { LoadingBar } from 'calypso/components/loading-bar';
import { errorNotice } from 'calypso/state/notices/actions';
import store from 'store';

const ActionPanelStyled = styled( ActionPanel )( {
	fontSize: '14px',
	fontWeight: 400,
	'.action-panel__body': {
		color: 'var(--studio-gray-70)',
	},
} );

export function AcceptSiteTransfer( props: any ) {
	const dispatch = props.dispatch;

	const progress = 0.2;

	const fetchAndAcceptInvite = async ( props: any ) => {
		try {
			const { siteId, inviteKey, redirectTo } = props;
			const response = await wpcom.req.get( `/sites/${ siteId }/invites/${ inviteKey }` );
			const invite = normalizeInvite( response );

			invite.inviteKey = inviteKey;

			await dispatch( acceptInvite( invite, null ) );

			store.set( 'accepted_site_transfer_invite', invite );
			navigate( redirectTo );
		} catch {
			dispatch( errorNotice( 'Failed to accept the transfer!' ) );
			navigate( '/sites' );
		}
	};

	useEffect( () => {
		fetchAndAcceptInvite( props );
	} );

	const translate = useTranslate();
	return (
		<Main>
			<NavigationHeader navigationItems={ [] } title={ translate( 'Site Transfer' ) } />
			<HeaderCake isCompact={ true }>
				<h1>{ translate( 'Site Transfer' ) }</h1>
			</HeaderCake>
			<ActionPanelStyled>
				<p>
					<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
				</p>
				<p>{ translate( 'We are transferring your site.' ) }</p>
			</ActionPanelStyled>
		</Main>
	);
}
