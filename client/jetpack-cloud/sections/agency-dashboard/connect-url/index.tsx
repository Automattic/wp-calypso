import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import QueryJetpackManageAddSiteUrl, {
	SuccessData,
} from 'calypso/components/data/query-jetpack-manage-add-site-url';
import { useDispatch, useSelector } from 'calypso/state';
import {
	setSiteValidatingStatusValidating,
	setSiteValidatingStatusJetpackConnected,
	setSiteValidatingStatusWordPressSite,
	setSiteValidatingStatusNonWordPressSite,
	setSiteValidatingStatusNotExists,
} from 'calypso/state/jetpack-agency-dashboard/actions';
import { getValidatedSites } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { JETPACK_CONNECT_COMPLETE_FLOW } from 'calypso/state/jetpack-connect/action-types';
import SitesInput from './sites-input';
import ValidateSites from './validate-sites';
import './style.scss';

export default function ConnectUrl() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const validatedSites = useSelector( getValidatedSites );

	const [ detectedSites, setDetectedSites ] = useState( [] as string[] );
	const [ detectedFilename, setDetectedFilename ] = useState( '' );
	const [ validating, setValidating ] = useState( false );
	const [ currentValidatingSite, setCurrentValidatingSite ] = useState( '' );
	const [ csvColumns, setCSVColumns ] = useState( [] as string[] );
	const [ selectedColumn, setSelectedColumn ] = useState( '' );
	const [ currentValidatingSiteIndex, setCurrentValidatingSiteIndex ] = useState( 0 );
	const [ csvConfirmed, setCSVConfirmed ] = useState( false );

	const handleValidationSuccess = useCallback(
		( data: SuccessData ) => {
			if ( data.exists ) {
				if ( data.isJetpackConnected ) {
					dispatch( setSiteValidatingStatusJetpackConnected( currentValidatingSite ) );
				}

				if ( ! data.isWordPress ) {
					dispatch( setSiteValidatingStatusWordPressSite( currentValidatingSite ) );
				} else {
					dispatch( setSiteValidatingStatusNonWordPressSite( currentValidatingSite ) );
				}
			} else {
				dispatch( setSiteValidatingStatusNotExists( currentValidatingSite ) );
			}

			/* Checks if there is another site to validate and moves the cursor forward */
			const nextValidatingSiteIndex = currentValidatingSiteIndex + 1;
			if ( nextValidatingSiteIndex < detectedSites.length ) {
				const siteData = detectedSites[ nextValidatingSiteIndex ];
				// A check for siteData here might seem useless, but I am considering edge cases
				// where the CSV file might be in a bad state and the condition above would still pass
				if ( siteData ) {
					const columnIndex = csvColumns.indexOf( selectedColumn );
					const nextSiteUrl = siteData.split( ',' )[ columnIndex ];
					dispatch( setSiteValidatingStatusValidating( nextSiteUrl ) );
					setCurrentValidatingSite( nextSiteUrl );
					setCurrentValidatingSiteIndex( nextValidatingSiteIndex );
				}
			} else {
				setValidating( false );
				setCurrentValidatingSite( '' );
				setCurrentValidatingSiteIndex( 0 );
			}
			dispatch( { type: JETPACK_CONNECT_COMPLETE_FLOW } );
		},
		[
			currentValidatingSite,
			csvColumns,
			currentValidatingSiteIndex,
			detectedSites,
			setCurrentValidatingSite,
			validatedSites,
			dispatch,
		]
	);

	const handleCSVLoadConfirmation = useCallback(
		( column: string ) => {
			// Get the data from the first site on the list
			const siteData = detectedSites[ 0 ].split( ',' );
			// Get the index of the selected column from the columns list
			const columnIndex = csvColumns.indexOf( column );
			// Set the pointer to the first site to start the queue
			setCurrentValidatingSite( siteData[ columnIndex ] );
			setCurrentValidatingSiteIndex( 0 );
			// Define the selected column
			setSelectedColumn( column );
			// Initialize the map that stores the validation results
			dispatch( setSiteValidatingStatusValidating( siteData[ columnIndex ] ) );
			setValidating( true );
			setCSVConfirmed( true );
		},
		[ detectedSites, csvColumns, validatedSites ]
	);

	const onCSVLoad = useCallback(
		( fileContents: string[] ) => {
			const columns: string[] = fileContents[ 0 ].split( ',' );
			const sitesData: string[] = fileContents.slice( 1 );
			setCSVColumns( columns );
			setDetectedSites( sitesData );
		},
		[ setCSVColumns, setDetectedSites ]
	);

	const pageTitle = validating ? translate( 'Adding sites' ) : translate( 'Add sites by URL' );
	const pageSubtitle = validating
		? translate( 'Please wait while we add all sites to your account.' )
		: translate( 'Add one or multiple sites at once by entering their address below.' );

	return (
		<div className="connect-url">
			{ validating && (
				<QueryJetpackManageAddSiteUrl
					url={ currentValidatingSite }
					onSuccess={ handleValidationSuccess }
				/>
			) }

			<h2 className="connect-url__page-title">{ pageTitle }</h2>
			<div className="connect-url__page-subtitle">{ pageSubtitle }</div>
			{ ! csvConfirmed ? (
				<>
					<Card>
						<SitesInput
							{ ...{
								detectedSites,
								setDetectedSites,
								detectedFilename,
								setDetectedFilename,
								onCSVLoad,
							} }
							onCSVLoadConfirmation={ handleCSVLoadConfirmation }
						/>
					</Card>
				</>
			) : (
				<Card>
					<ValidateSites
						{ ...{ detectedSites } }
						urlColumnIndex={ csvColumns.indexOf( selectedColumn ) }
						validatedSites={ validatedSites }
					/>
				</Card>
			) }
		</div>
	);
}
