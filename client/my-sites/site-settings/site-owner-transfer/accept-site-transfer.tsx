/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import ActionPanel from 'calypso/components/action-panel';
import Main from 'calypso/components/main';
import { navigate } from 'calypso/lib/navigate';
import { acceptInvite } from 'calypso/state/invites/actions';
import { useEffect } from '@wordpress/element';
import wpcom from 'calypso/lib/wp';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import { LoadingBar } from 'calypso/components/loading-bar';
import store from 'store';
import DocumentHead from 'calypso/components/data/document-head';
import { Global, css } from '@emotion/react';
import MasterbarStyled from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled';
import { useState } from 'react';
import Notice from 'calypso/components/notice';

const ActionPanelStyled = styled( ActionPanel )( {
	fontSize: '14px',
	margin: '20% 30px 0 30px',
	fontWeight: 400,
	'.action-panel__body': {
		color: 'var(--studio-gray-70)',
	},
} );

export function AcceptSiteTransfer( props: any ) {
	const translate = useTranslate();
	const dispatch = props.dispatch;
	const progress = 0.15;
	const [ error, setError ] = useState< string >( '' );

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
			setError(
				translate(
					'Failed to add you as an administrator in the site. Please contact the original site owner to invite you as administrator first'
				)
			);
		}
	};

	useEffect( () => {
		fetchAndAcceptInvite( props );
	} );

	const renderLoadingBar = () => {
		return (
			<>
				<p>{ translate( 'Hold tight. We are making it happen!' ) }</p>
				<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
			</>
		);
	};

	const renderError = () => {
		return (
			<Notice status="is-error" showDismiss={ false }>
				<div data-testid="error">
					<p>{ error }</p>
				</div>
			</Notice>
		);
	};

	return (
		<>
			<DocumentHead title={ translate( 'Site Transfer' ) } />
			<Global
				styles={ css`
					body.is-section-settings,
					body.is-section-settings .layout__content {
						background: var( --studio-white );
					}
				` }
			/>
			<MasterbarStyled canGoBack={ false } />
			<Main>
				<ActionPanelStyled>{ ! error ? renderLoadingBar() : renderError() }</ActionPanelStyled>
			</Main>
		</>
	);
}
