import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { siteByIdQuery } from 'calypso/dashboard/app/queries/site';
import { siteLatestAtomicTransferQuery } from 'calypso/dashboard/app/queries/site-atomic-transfers';
import { Callout } from 'calypso/dashboard/components/callout';
import {
	isAtomicTransferInProgress,
	isAtomicTransferredSite,
} from 'calypso/dashboard/utils/site-atomic-transfers';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import HostingActivationButton from '../hosting-activation-button';
import illustrationUrl from './hosting-callout-illustration.svg';

export function HostingActivationCallout( {
	siteId,
	redirectUrl,
}: {
	siteId: number;
	redirectUrl?: string;
} ) {
	const dispatch = useDispatch();
	const { data: latestAtomicTransfer } = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: !! siteId,
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return isAtomicTransferInProgress( query.state.data.status ) ? 5000 : false;
		},
		refetchIntervalInBackground: true,
	} );

	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return ! isAtomicTransferredSite( query.state.data ) ? 2000 : false;
		},
		enabled: !! siteId && latestAtomicTransfer?.status === 'completed',
	} );

	const isActivating =
		latestAtomicTransfer &&
		( isAtomicTransferInProgress( latestAtomicTransfer.status ) ||
			// Keep displaying “Activating…” until the page redirects.
			latestAtomicTransfer?.status === 'completed' );

	const isActivated =
		latestAtomicTransfer?.status === 'completed' && site && isAtomicTransferredSite( site );

	useEffect( () => {
		const handleActivated = async () => {
			await dispatch( requestSite( siteId ) );
			if ( redirectUrl ) {
				page.replace( redirectUrl );
			} else {
				page.show(
					addQueryArgs( window.location.href.replace( window.location.origin, '' ), {
						activated: true,
					} )
				);
			}
		};

		if ( isActivated ) {
			handleActivated();
		}
	}, [ isActivated, siteId, redirectUrl, dispatch ] );

	return (
		<Callout
			title={ __( 'Activate hosting features' ) }
			titleAs="h3"
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Your plan includes a range of powerful hosting features. Activate them to get started.'
						) }
					</Text>
					<ul style={ { listStyle: 'none', margin: 0 } }>
						<Text as="li" variant="muted">
							{ __( 'Git-based deployments' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Server monitoring' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Access and error logs' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Secure access via SFTP/SSH' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Advanced server settings' ) }
						</Text>
					</ul>
				</>
			}
			actions={
				<HostingActivationButton
					text={ isActivating ? __( 'Activating…' ) : __( 'Activate' ) }
					size="compact"
					redirectUrl={ redirectUrl ?? window.location.href.replace( window.location.origin, '' ) }
				/>
			}
		/>
	);
}

export function HostingUpsellCallout( { siteSlug }: { siteSlug: string } ) {
	return (
		<Callout
			title={ __( 'Unlock all hosting features' ) }
			titleAs="h3"
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __( 'Upgrade to the Business plan to unlock a range of powerful hosting features.' ) }
					</Text>
					<ul style={ { listStyle: 'none', margin: 0 } }>
						<Text as="li" variant="muted">
							{ __( 'Git-based deployments' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Server monitoring' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Access and error logs' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Secure access via SFTP/SSH' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Advanced server settings' ) }
						</Text>
					</ul>
				</>
			}
			actions={
				<Button
					text={ __( 'Upgrade plan' ) }
					variant="primary"
					size="compact"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}
