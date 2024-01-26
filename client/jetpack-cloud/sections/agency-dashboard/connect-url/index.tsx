import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import QueryJetpackManageAddSiteUrl, {
	SuccessData,
} from 'calypso/components/data/query-jetpack-manage-add-site-url';
import { useDispatch } from 'calypso/state';
import { JETPACK_CONNECT_COMPLETE_FLOW } from 'calypso/state/jetpack-connect/action-types';
import { errorNotice, plainNotice, successNotice } from 'calypso/state/notices/actions';
import CSVColumnConfirmation from './csv-column-confirmation';
import SitesInput from './sites-input';
import ValidateSites from './validate-sites';
import './style.scss';

export default function ConnectUrl() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ detectedSites, setDetectedSites ] = useState( [] as string[] );
	const [ detectedFilename, setDetectedFilename ] = useState( '' );
	const [ validating, setValidating ] = useState( false );
	const [ currentValidatingSite, setCurrentValidatingSite ] = useState( '' );
	const [ csvColumns, setCSVColumns ] = useState( [] as string[] );
	const [ URLColumn, setURLColumn ] = useState( '' );
	const [ currentValidatingSiteIndex, setCurrentValidatingSiteIndex ] = useState( 0 );
	const [ csvConfirmed, setCSVConfirmed ] = useState( false );

	const handleValidationSuccess = useCallback(
		( data: SuccessData ) => {
			if ( data.exists ) {
				if ( data.isJetpackConnected ) {
					dispatch(
						plainNotice(
							translate( '"%(site)s" is already connected to Jetpack.', {
								args: { site: currentValidatingSite },
							} )
						)
					);
				}

				if ( ! data.isWordPress ) {
					dispatch(
						successNotice(
							translate( '"%(site)s" is not a WordPress site, adding as monitoring only.', {
								args: { site: currentValidatingSite },
							} )
						)
					);
				}
			} else {
				dispatch(
					errorNotice(
						translate( '"%(site)s" does not exist', {
							args: { site: currentValidatingSite },
						} )
					)
				);
			}

			/* Checks if there is another site to validate */
			if ( currentValidatingSiteIndex + 1 <= detectedSites.length ) {
				const siteData = detectedSites[ currentValidatingSiteIndex + 1 ];
				if ( siteData ) {
					const columnIndex = csvColumns.indexOf( URLColumn );
					dispatch( { type: JETPACK_CONNECT_COMPLETE_FLOW } );
					setCurrentValidatingSite( siteData.split( ',' )[ columnIndex ] );
					setCurrentValidatingSiteIndex( currentValidatingSiteIndex + 1 );
				}
			} else {
				setValidating( false );
				setCurrentValidatingSite( '' );
				setCurrentValidatingSiteIndex( 0 );
			}
		},
		[
			currentValidatingSite,
			URLColumn,
			csvColumns,
			currentValidatingSiteIndex,
			translate,
			detectedSites,
			dispatch,
			setCurrentValidatingSite,
		]
	);

	const handleColumnConfirmation = useCallback(
		( option: string ) => {
			const siteData = detectedSites[ 0 ].split( ',' );
			const columnIndex = csvColumns.indexOf( option );
			setCurrentValidatingSite( siteData[ columnIndex ] );
			setCurrentValidatingSiteIndex( 0 );
			setURLColumn( option );
			setValidating( true );
		},
		[ detectedSites, csvColumns ]
	);

	const handleCSVLoadConfirmation = () => {
		setCSVConfirmed( true );
	};

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
			<QueryJetpackManageAddSiteUrl
				url={ currentValidatingSite }
				onSuccess={ handleValidationSuccess }
			/>
			<h2 className="connect-url__page-title">{ pageTitle }</h2>
			<div className="connect-url__page-subtitle">{ pageSubtitle }</div>

			<Card>
				{ ! csvConfirmed ? (
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
				) : null }
				{ csvConfirmed && ! validating ? (
					<CSVColumnConfirmation
						csvColumns={ csvColumns }
						setURLColumn={ handleColumnConfirmation }
					/>
				) : null }
				{ validating ? (
					<ValidateSites
						{ ...{ detectedSites } }
						urlColumnIndex={ csvColumns.indexOf( URLColumn ) }
					/>
				) : null }
			</Card>
		</div>
	);
}
