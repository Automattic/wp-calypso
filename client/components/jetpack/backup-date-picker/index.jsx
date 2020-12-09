/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Button from 'calypso/components/forms/form-button';
import DateRangeSelector from 'calypso/my-sites/activity/filterbar/date-range-selector';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

const BackupDatePicker = ( {
	siteId,
	siteSlug,
	today,
	selectedDate,
	onDateChange,
	oldestDateAvailable,
	moment,
	translate,
	dispatchRecordTracksEvent,
} ) => {
	const getDisplayDate = ( date, showTodayYesterday = true ) => {
		if ( showTodayYesterday ) {
			const isToday = today.isSame( date, 'day' );
			const isYesterday = moment( today ).add( -1, 'day' ).isSame( date, 'day' );

			if ( isToday ) {
				return translate( 'Today' );
			}
			if ( isYesterday ) {
				return translate( 'Yesterday' );
			}
		}
		const yearToday = moment( today ).format( 'YYYY' );
		const yearDate = moment( date ).format( 'YYYY' );

		const dateFormat = yearToday === yearDate ? 'MMM D' : 'MMM D, YYYY';

		return moment( date ).format( dateFormat );
	};

	const previousDate = moment( selectedDate ).subtract( 1, 'days' );
	const nextDate = moment( selectedDate ).add( 1, 'days' );

	const previousDisplayDate = getDisplayDate( previousDate );
	const nextDisplayDate = getDisplayDate( nextDate, false );

	const canGoToPreviousDay = () =>
		! oldestDateAvailable || ! moment( selectedDate ).isSame( oldestDateAvailable, 'day' );
	const canGoToNextDay = () => ! moment( today ).isSame( moment( selectedDate ), 'day' );

	const goToPreviousDay = () => {
		if ( ! canGoToPreviousDay() ) {
			return false;
		}

		const newSelectedDate = moment( selectedDate ).subtract( 1, 'days' );

		dispatchRecordTracksEvent( 'calypso_jetpack_backup_date_previous' );

		onDateChange( newSelectedDate );
	};

	const goToNextDay = () => {
		if ( ! canGoToNextDay() ) {
			return false;
		}

		const newSelectedDate = moment( selectedDate ).add( 1, 'days' );

		dispatchRecordTracksEvent( 'calypso_jetpack_backup_date_next' );

		onDateChange( newSelectedDate );
	};

	const onSpace = ( evt, fn ) => {
		if ( evt.key === ' ' ) {
			return fn;
		}

		return () => {};
	};

	return (
		<div className="backup-date-picker">
			<div className="backup-date-picker__select-date">
				<div
					className="backup-date-picker__select-date--previous"
					role="button"
					tabIndex={ 0 }
					onClick={ goToPreviousDay }
					onKeyDown={ onSpace( goToPreviousDay ) }
				>
					<Button compact borderless className="backup-date-picker__button--previous">
						<Gridicon icon="chevron-left" className={ ! canGoToPreviousDay() && 'disabled' } />
					</Button>

					<span
						className={ classNames( 'backup-date-picker__display-date', {
							disabled: ! canGoToPreviousDay(),
						} ) }
					>
						{ previousDisplayDate }
					</span>
				</div>

				{ isEnabled( 'jetpack/backups-date-picker' ) && (
					<DateRangeSelector
						siteId={ siteId }
						enabled={ true }
						customLabel={ <Gridicon icon="calendar" /> }
					/>
				) }

				<div
					className="backup-date-picker__select-date--next"
					role="button"
					tabIndex={ 0 }
					onClick={ goToNextDay }
					onKeyDown={ onSpace( goToNextDay ) }
				>
					<div className="backup-date-picker__next-date-link">
						<span
							className={ classNames( 'backup-date-picker__display-date', {
								disabled: ! canGoToNextDay(),
							} ) }
						>
							{ nextDisplayDate }
						</span>

						<Button compact borderless className="backup-date-picker__button--next">
							<Gridicon icon="chevron-right" className={ ! canGoToNextDay() && 'disabled' } />
						</Button>
					</div>
					{ isEnabled( 'jetpack/backups-date-picker' ) && (
						<a
							className="backup-date-picker__search-link"
							href={ `/activity-log/${ siteSlug }` }
							onClick={ () => {
								dispatchRecordTracksEvent( 'calypso_jetpack_backup_search' );
							} }
						>
							<Gridicon icon="search" className="backup-date-picker__search-icon" />
						</a>
					) }
				</div>
			</div>
		</div>
	);
};

export default connect(
	( state ) => {
		return {
			siteId: getSelectedSiteId( state ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( withLocalizedMoment( BackupDatePicker ) ) );
