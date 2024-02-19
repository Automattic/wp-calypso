import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import useCreateUrlOnlySiteMutation from 'calypso/components/data/query-jetpack-manage-add-site-url/use-create-url-only-site-mutation';
import CreateSites, { Site } from './create-sites';
import SitesInput from './sites-input';
import './style.scss';

export default function ConnectUrl() {
	const translate = useTranslate();

	const [ queue, setQueue ] = useState( [] as Site[] );
	const [ processed, setProcessed ] = useState( [] as Site[] );
	const [ csvConfirmed, setCsvConfirmed ] = useState( false );
	const isProcessing = queue.length > 0;
	const createUrlOnlySiteMutation = useCreateUrlOnlySiteMutation();

	const shiftQueue = useCallback(
		( success: boolean ) => {
			// Cheeky immutable Array.shift through destructuring.
			const [ shift, ...rest ] = queue;

			shift.status = success ? 'success' : 'error';
			setProcessed( [ ...processed, shift ] );
			setQueue( rest );
			return shift;
		},
		[ queue, setQueue ]
	);

	const onCreateSiteSuccess = useCallback( () => {
		shiftQueue( true );
	}, [ shiftQueue, setQueue ] );

	const onCreateSiteError = useCallback( () => {
		shiftQueue( false );
	}, [ shiftQueue, setQueue ] );

	const onConfirm = useCallback(
		( sites: string[] ) => {
			setCsvConfirmed( true );
			setQueue( sites.map( ( site ) => ( { url: site || '', status: 'pending' } ) ) );
		},
		[ setCsvConfirmed, setQueue ]
	);

	useEffect( () => {
		if ( queue.length < 1 ) {
			return;
		}

		createUrlOnlySiteMutation.mutate(
			{ url: queue[ 0 ].url },
			{
				onSuccess: onCreateSiteSuccess,
				onError: onCreateSiteError,
			}
		);
	}, [ queue, createUrlOnlySiteMutation.mutate ] );

	const pageTitle = isProcessing ? translate( 'Adding sites' ) : translate( 'Add sites by URL' );
	const pageSubtitle = isProcessing
		? translate( 'Please wait while we add all sites to your account.' )
		: translate( 'Add one or multiple sites at once by entering their address below.' );

	return (
		<div className="connect-url">
			<h2 className="connect-url__page-title">{ pageTitle }</h2>
			<div className="connect-url__page-subtitle">{ pageSubtitle }</div>
			<Card>
				{ ! csvConfirmed ? (
					<SitesInput onConfirm={ onConfirm } />
				) : (
					<CreateSites processed={ processed } queue={ queue } />
				) }
			</Card>
		</div>
	);
}
