import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect } from 'react';
import QueryBackupStagingSite from 'calypso/components/data/query-backup-staging-site';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getBackupStagingSiteInfo from 'calypso/state/rewind/selectors/get-backup-staging-site-info';
import getBackupStagingUpdateRequestStatus from 'calypso/state/rewind/selectors/get-backup-staging-update-status';
import hasFetchedStagingSiteInfo from 'calypso/state/rewind/selectors/has-fetched-staging-site-info';
import isRequestingStagingSiteInfo from 'calypso/state/rewind/selectors/is-requesting-staging-site-info';
import { requestUpdateBackupStagingFlag } from 'calypso/state/rewind/staging/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const JetpackStagingSitesManagement: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const isRequesting = useSelector( ( state ) => isRequestingStagingSiteInfo( state, siteId ) );
	const updateRequestStatus = useSelector( ( state ) =>
		getBackupStagingUpdateRequestStatus( state, siteId )
	);
	const hasFetched = useSelector( ( state ) => hasFetchedStagingSiteInfo( state, siteId ) );
	const stagingInfo = useSelector( ( state ) => getBackupStagingSiteInfo( state, siteId ) );

	const isStaging = stagingInfo?.staging ?? false;
	const [ stagingToggle, setStagingToggle ] = useState( false );

	// Use constant for updateRequestStatus instead of just the string for comparison
	const isLoading = isRequesting || updateRequestStatus === 'pending';

	// Set the staging toggle once we have fetched the staging info
	useEffect( () => {
		if ( hasFetched && ! isLoading ) {
			setStagingToggle( isStaging );
		}
	}, [ hasFetched, isLoading, isStaging ] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_setup_staging_site_view' ) );
	}, [ dispatch ] );

	const toggleStagingFlag = useCallback( () => {
		setStagingToggle( ! stagingToggle );
		dispatch( requestUpdateBackupStagingFlag( siteId, ! isStaging ) );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_setup_staging_site_toggle', {
				toggle: ! isStaging,
			} )
		);
	}, [ dispatch, isStaging, siteId, stagingToggle ] );

	const stagingIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			viewBox="0 0 24 24"
			className="staging-icon"
		>
			<path
				fill="#4F3500"
				fillRule="evenodd"
				d="M16.365 4.868l-2.26 2.26.512 1.912 1.912.513 2.26-2.26a4 4 0 11-2.424-2.425z"
				clipRule="evenodd"
			></path>
			<path
				fill="#4F3500"
				fillRule="evenodd"
				d="M6.89 16.06a.5.5 0 10.706.708.5.5 0 00-.707-.707zM5.828 15a2 2 0 002.828 2.828l5.657-5.657a2 2 0 00-2.829-2.828L5.83 15z"
				clipRule="evenodd"
			></path>
		</svg>
	);

	return (
		<>
			<QueryBackupStagingSite siteId={ siteId } />
			<div className="jetpack-staging-sites-management">
				<Card compact className="setting-title">
					<h3>{ translate( 'Set up as staging site' ) }</h3>
					<div className="staging-icon">{ stagingIcon }</div>
				</Card>
				<Card className="setting-content">
					<div className="setting-option">
						<div className="setting-option__toggle">
							<ToggleControl
								label={ translate(
									'{{strong}}Set this site as a Staging Site.{{/strong}} You will be able to copy any site to this staging site and test your changes safely.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
								disabled={ isLoading }
								checked={ isStaging }
								onChange={ toggleStagingFlag }
							/>
						</div>
					</div>
				</Card>
			</div>
		</>
	);
};

export default JetpackStagingSitesManagement;
