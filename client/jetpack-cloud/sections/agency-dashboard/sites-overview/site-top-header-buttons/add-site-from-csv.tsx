import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import QueryJetpackManageAddSiteUrl from 'calypso/components/data/query-jetpack-manage-add-site-url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, plainNotice, successNotice } from 'calypso/state/notices/actions';

export default function AddSiteFromCSV() {
	const [ siteList, setSiteList ] = useState( [] );
	const [ listIndex, setListIndex ] = useState( -1 );
	const [ currentQueryingSite, setCurrentQueryingSite ] = useState();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const handleQueryResponse = ( data ) => {
		if ( data.exists ) {
			if ( data.isJetpackConnected ) {
				dispatch(
					plainNotice(
						translate( '"%(site)s" is already connected to Jetpack.', {
							args: { site: siteList[ listIndex ].domain },
						} )
					)
				);
			}

			if ( ! data.isWordPress ) {
				dispatch(
					successNotice( '"%(site)s" is not a WordPress site, adding as monitoring only.', {
						args: { site: siteList[ listIndex ].domain },
					} )
				);
			}
		} else {
			dispatch(
				errorNotice(
					translate( '"%(site)s" does not exists', {
						args: { site: siteList[ listIndex ].domain },
					} )
				)
			);
		}

		// Go to next queued site or finish
		if ( listIndex === siteList.length - 1 ) {
			dispatch(
				successNotice(
					translate( 'Finished adding sites from CSV. Please refresh the page to see the changes.' )
				)
			);
			setCurrentQueryingSite( null );
			setListIndex( -1 );
			setSiteList( [] );
			return;
		}

		setCurrentQueryingSite( siteList[ listIndex + 1 ].domain );
		setListIndex( listIndex + 1 );
	};

	const onCSVUploadClick = useCallback( () => {
		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = '.csv';
		fileInput.onchange = () => {
			const file = fileInput.files?.[ 0 ];
			if ( file ) {
				dispatch(
					recordTracksEvent( 'calypso_jetpack_agency_dashboard_sites_overview_upload_csv_click' )
				);

				const reader = new FileReader();
				reader.onload = ( e ) => {
					const lines = ( e.target?.result as string ).split( '\n' );

					const nextSiteList = lines.map( ( line: string ) => {
						const [ siteUrl, siteName ] = line.split( ',' );
						return { domain: siteUrl, name: siteName };
					} ) as never[];

					setSiteList( nextSiteList );
					setListIndex( 1 ); // Starts the url validation query
					setCurrentQueryingSite( nextSiteList[ 1 ].domain );
				};

				reader.readAsText( file );
			}
		};
		fileInput.click();
	}, [ dispatch, setListIndex, setSiteList ] );

	return (
		<>
			{ currentQueryingSite && (
				<QueryJetpackManageAddSiteUrl
					url={ currentQueryingSite }
					onSuccess={ handleQueryResponse }
				/>
			) }
			<Button onClick={ onCSVUploadClick }>{ translate( 'Add sites from CSV' ) }</Button>
		</>
	);
}
