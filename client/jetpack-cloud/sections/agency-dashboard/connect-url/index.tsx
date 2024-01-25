import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import QueryJetpackManageAddSiteUrl, {
	SuccessData,
} from 'calypso/components/data/query-jetpack-manage-add-site-url';
import { useDispatch } from 'calypso/state';
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
						successNotice( '"%(site)s" is not a WordPress site, adding as monitoring only.', {
							args: { site: currentValidatingSite },
						} )
					);
				}
			} else {
				dispatch(
					errorNotice(
						translate( '"%(site)s" does not exists', {
							args: { site: currentValidatingSite },
						} )
					)
				);
			}

			if ( currentValidatingSiteIndex + 1 <= detectedSites.length ) {
				const columnIndex = csvColumns.indexOf( URLColumn );
				const siteData = detectedSites[ currentValidatingSiteIndex + 1 ].split( ',' );
				setCurrentValidatingSite( siteData[ columnIndex ] );
				setCurrentValidatingSiteIndex( ( prevState ) => prevState + 1 );
			} else {
				setValidating( false );
				setCurrentValidatingSite( '' );
				setCurrentValidatingSiteIndex( 0 );
			}
		},
		[
			currentValidatingSite,
			translate,
			detectedSites,
			dispatch,
			setCurrentValidatingSite,
			setDetectedSites,
		]
	);

	const handleColumnConfirmation = useCallback(
		( option: string ) => {
			const siteData = detectedSites[ 0 ].split( ',' );
			const columnIndex = csvColumns.indexOf( option );
			setCurrentValidatingSite( siteData[ columnIndex ] );
			setURLColumn( option );
			setValidating( true );
		},
		[ detectedSites, csvColumns ]
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
				{ ! csvColumns.length ? (
					<SitesInput
						{ ...{
							detectedSites,
							setDetectedSites,
							detectedFilename,
							setDetectedFilename,
							setCSVColumns,
						} }
					/>
				) : (
					! validating && (
						<CSVColumnConfirmation
							csvColumns={ csvColumns }
							setURLColumn={ handleColumnConfirmation }
						/>
					)
				) }
				{ validating ? <ValidateSites { ...{ detectedSites } } /> : null }
			</Card>
		</div>
	);
}
