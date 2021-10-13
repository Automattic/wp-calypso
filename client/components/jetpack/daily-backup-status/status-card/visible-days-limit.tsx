import { useTranslate } from 'i18n-calypso';
import { MomentInput } from 'moment';
import { useCallback, useEffect, useMemo } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import cloudSuccessIcon from './icons/cloud-success.svg';
import './style.scss';

type OwnProps = {
	selectedDate: MomentInput;
};

// Slightly different from the implementation in ../use-get-display-date,
// this version only returns the date (i.e., time is excluded)
const useDisplayDate = ( date: MomentInput ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );

	return useMemo( () => {
		const dateWithOffset = applySiteOffset( date, { gmtOffset, timezone } );
		const now = applySiteOffset( Date.now(), { gmtOffset, timezone } );

		return dateWithOffset.isSame( now, 'year' )
			? dateWithOffset.format( 'MMM D' )
			: dateWithOffset.format( 'll' );
	}, [ date, gmtOffset, timezone ] );
};

const VisibleDaysLimit: React.FC< OwnProps > = ( { selectedDate } ) => {
	const translate = useTranslate();
	const displayDate = useDisplayDate( selectedDate );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const visibleDays = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	) as number;

	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_backup_visiblelimit_upsell_view', { site_id: siteId } ) );
	}, [ dispatch, siteId ] );
	const recordUpsellButtonClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_backup_visiblelimit_upsell_click', { site_id: siteId } )
		);
	}, [ dispatch, siteId ] );

	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div className="visible-days-limit">
			<div className="status-card__message-head">
				<img src={ cloudSuccessIcon } alt="" role="presentation" />
				<div>{ displayDate }</div>
			</div>
			<div className="status-card__title">
				{ translate(
					'Restore backups older than %(days)d day',
					'Restore backups older than %(days)d days',
					{ count: visibleDays, args: { days: visibleDays } }
				) }
			</div>
			<div className="status-card__label">
				<p>
					{ translate(
						'Your activity log spans more than %(days)d day. Upgrade your backup storage to access activity older than %(days)d day.',
						'Your activity log spans more than %(days)d days. Upgrade your backup storage to access activity older than %(days)d days.',
						{ count: visibleDays, args: { days: visibleDays } }
					) }
				</p>
				<Button
					className="status-card__button"
					href={
						isJetpackCloud() ? `/pricing/storage/${ siteSlug }` : `/plans/storage/${ siteSlug }`
					}
					onClick={ recordUpsellButtonClick }
				>
					{ translate( 'Upgrade storage' ) }
				</Button>
			</div>
		</div>
	);
};

export default VisibleDaysLimit;
