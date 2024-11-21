import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import ActionPanel from 'calypso/components/action-panel';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import { useInterval } from 'calypso/lib/interval';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import MasterbarStyled from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled';
import normalizeInvite from 'calypso/my-sites/invites/invite-accept/utils/normalize-invite';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { acceptInvite } from 'calypso/state/invites/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ActionPanelStyled = styled( ActionPanel )( {
	fontSize: '14px',
	margin: '20% 30px 0 30px',
	fontWeight: 400,
	'.action-panel__body': {
		color: 'var(--studio-gray-70)',
	},
} );

export function AcceptSiteTransfer( props: any ) {
	const { siteId, inviteKey } = props;
	const translate = useTranslate();
	const dispatch = props.dispatch;
	const progress = 0.15;
	const maxAttempts = 10;

	const selectedSiteId = useSelector( ( state: object ) => getSelectedSiteId( state ) );
	const site = useSelector( ( state: object ) => getSite( state, props.siteId ) );
	const userId = useSelector( ( state: object ) => getCurrentUserId( state ) );

	const [ error, setError ] = useState< string | React.ReactNode >( '' );
	const [ inviteAccepted, setInviteAccepted ] = useState< boolean >( false );
	const [ currentAttempt, setCurrentAttempt ] = useState< number >( 0 );

	const isSiteOwner = site && site.site_owner === userId;

	const fetchAndAcceptInvite = useCallback( async () => {
		try {
			const pendingInvite = await wpcom.req
				.get( `/sites/${ siteId }/invites/${ inviteKey }` )
				.catch( ( error: any ) => {
					throw error;
				} );
			const invite = normalizeInvite( pendingInvite );

			invite.inviteKey = inviteKey;

			await dispatch( acceptInvite( invite, null ) );

			setInviteAccepted( true );
		} catch ( error: any ) {
			setError(
				error?.message ??
					translate(
						'Failed to add you as an administrator in the site. Please contact the original site owner to invite you as administrator first.'
					)
			);
		}
	}, [ dispatch, translate, siteId, inviteKey ] );

	// set the selected site id if it's not set. This is needed to display masterbar correctly.
	// This is happening because this route does not use `siteSelection` middleware.
	useEffect( () => {
		if ( site && selectedSiteId !== site.ID ) {
			dispatch( setSelectedSiteId( site.ID ) );
		}
	}, [ selectedSiteId, site, dispatch ] );

	// attempt to accept the invite
	useEffect( () => {
		if ( ! inviteAccepted ) {
			fetchAndAcceptInvite();
		}
	}, [ inviteAccepted, fetchAndAcceptInvite, siteId, inviteKey ] );

	// redirect to the site confirmation page if the invite was accepted and the user is the site owner
	useEffect( () => {
		let redirect = props.redirectTo ?? null;

		// If the redirect is not set and site is set, redirect to the usual confirmation page
		if ( ! redirect && site ) {
			redirect = '/settings/site-transferred/' + site.slug;
		}

		// If the redirect is not set, redirect to the /sites page
		if ( ! redirect ) {
			redirect = '/sites';
		}

		if ( isSiteOwner ) {
			navigate( redirect );
		}
	}, [ isSiteOwner, site, props ] );

	// show an error message if the user is not the site owner
	useEffect( () => {
		if ( currentAttempt > maxAttempts ) {
			setError(
				translate(
					'There was an error while processing the site transfer. Please {{link}}contact our support team{{/link}} for help.',
					{
						components: {
							link: <a href="/help" />,
						},
					}
				)
			);
		}
	}, [ currentAttempt, translate ] );

	useInterval(
		async () => {
			dispatch( requestSite( props.siteId ) );
			setCurrentAttempt( ( attempt ) => attempt + 1 );
		},
		inviteAccepted && ! isSiteOwner && ! error ? 3000 : null
	);

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
