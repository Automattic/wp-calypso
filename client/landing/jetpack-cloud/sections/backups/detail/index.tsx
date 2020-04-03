/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateFilter } from 'state/activity-log/actions';
import { useSiteOffset } from 'landing/jetpack-cloud/components/site-offset';
import ActivityLog from 'landing/jetpack-cloud/sections/backups/components/activity-log';

interface Props {
	backupId: string;
	site: string;
}

const BackupDetailPage: FunctionComponent< Props > = ( { backupId } ) => {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const applySiteOffset = useSiteOffset();

	const backupDateMoment = applySiteOffset( parseFloat( backupId ) * 1000 );

	useEffect( () => {
		dispatch(
			updateFilter( siteId, {
				group: null,
				after: backupDateMoment?.startOf( 'day' ).toISOString(),
				before: backupDateMoment?.endOf( 'day' ).toISOString(),
				on: null,
				page: 1,
			} )
		);
	}, [ dispatch, siteId, backupDateMoment ] );

	return (
		<div>
			<p>{ backupDateMoment ? backupDateMoment.format( 'LLL' ) : 'loading...' }</p>
			{ siteId && (
				<ActivityLog siteId={ siteId } allowRestore={ false } showDateRangeSelector={ false } />
			) }
		</div>
	);
};

export default BackupDetailPage;
