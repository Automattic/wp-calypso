import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import useCreateUrlOnlySiteMutation from 'calypso/components/data/query-jetpack-manage-add-site-url/use-create-url-only-site-mutation';
import SitesInput from './sites-input';
import ValidateSites, { Site } from './validate-sites';
import './style.scss';

export default function ConnectUrl() {
	const translate = useTranslate();

	const [ filename, setFilename ] = useState( '' );
	const [ sites, setSites ] = useState( [] as string[][] );
	const [ csvColumns, setCSVColumns ] = useState( [] as string[] );
	const [ queue, setQueue ] = useState( [] as Site[] );
	const [ processed, setProcessed ] = useState( [] as Site[] );
	const createUrlOnlySiteMutation = useCreateUrlOnlySiteMutation();

	const shiftQueue = useCallback( () => {
		// Cheeky immutable Array.shift through destructuring.
		const [ shift, ...rest ] = queue;
		setProcessed( [ ...processed, shift ] );
		setQueue( rest );
		return shift;
	}, [ queue, setQueue ] );

	const onCreateSiteSuccess = useCallback( () => {
		shiftQueue();
		// @todo show a success message about the return value from shiftQueue.
	}, [ shiftQueue, setQueue ] );

	const onCreateSiteError = useCallback( () => {
		shiftQueue();
		// @todo show an error message about the return value from shiftQueue.
	}, [ shiftQueue, setQueue ] );

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

	const [ selectedColumn, setSelectedColumn ] = useState( '' );
	const [ csvConfirmed, setCSVConfirmed ] = useState( false );
	const isProcessing = queue.length > 0;

	const handleCSVLoadConfirmation = useCallback(
		( column: string ) => {
			const index = csvColumns.indexOf( column );

			if ( index === -1 ) {
				return;
			}

			setSelectedColumn( column );
			setCSVConfirmed( true );
			setQueue( sites.map( ( site ) => ( { url: site[ index ] || '' } ) ) );
		},
		[ sites, selectedColumn ]
	);

	const onCSVLoad = useCallback(
		( lines: string[][] ) => {
			if ( lines.length < 2 ) {
				return;
			}
			setCSVColumns( lines[ 0 ] );
			setSites( lines.slice( 1 ) );
		},
		[ setCSVColumns, setSites ]
	);

	const pageTitle = isProcessing ? translate( 'Adding sites' ) : translate( 'Add sites by URL' );
	const pageSubtitle = isProcessing
		? translate( 'Please wait while we add all sites to your account.' )
		: translate( 'Add one or multiple sites at once by entering their address below.' );

	return (
		<div className="connect-url">
			<h2 className="connect-url__page-title">{ pageTitle }</h2>
			<div className="connect-url__page-subtitle">{ pageSubtitle }</div>
			{ ! csvConfirmed ? (
				<>
					<Card>
						<SitesInput
							{ ...{
								sites: sites,
								setSites: setSites,
								filename: filename,
								setFilename: setFilename,
								csvColumns,
								onCSVLoad,
							} }
							onCSVLoadConfirmation={ handleCSVLoadConfirmation }
						/>
					</Card>
				</>
			) : (
				<Card>
					<ValidateSites processed={ processed } queue={ queue } />
				</Card>
			) }
		</div>
	);
}
