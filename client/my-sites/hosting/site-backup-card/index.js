/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import getLastGoodRewindBackup from 'state/selectors/get-last-good-rewind-backup';
import { requestRewindBackups } from 'state/rewind/backups/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import { applySiteOffset } from 'lib/site/timezone';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';
import classNames from 'classnames';

const SiteBackupCard = ( {
	disabled,
	gmtOffset,
	lastGoodBackup,
	moment,
	requestBackups,
	siteId,
	timezone,
	translate,
} ) => {
	const hasRetrievedLastBackup = lastGoodBackup !== null;
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		const shouldRequestLastBackup = ! disabled && ! hasRetrievedLastBackup && ! isLoading;
		if ( shouldRequestLastBackup ) {
			requestBackups( siteId );
			setIsLoading( true );
		}
	}, [ disabled, isLoading, lastGoodBackup, siteId ] );

	useEffect( () => {
		if ( hasRetrievedLastBackup ) {
			setIsLoading( false );
		}
	}, [ hasRetrievedLastBackup ] );

	const lastGoodBackupTime = lastGoodBackup
		? applySiteOffset( moment.utc( lastGoodBackup.last_updated, 'YYYY-MM-DD hh:mma' ), {
				timezone,
				gmtOffset,
		  } )
		: null;

	return (
		<Card className={ classNames( 'site-backup-card', { [ 'is-disabled' ]: disabled } ) }>
			<CardHeading>{ translate( 'Site backup' ) }</CardHeading>
			{ hasRetrievedLastBackup && lastGoodBackup && ! isLoading && ! disabled && (
				<>
					<p className="site-backup-card__date">
						{ translate( 'Last backup was on:' ) }
						<strong>{ lastGoodBackupTime.format( 'LLL' ) }</strong>
					</p>
					<p className="site-backup-card__warning">
						{ translate(
							"If you restore your site using this backup, you'll lose any changes made after that date."
						) }
					</p>
				</>
			) }
			{ hasRetrievedLastBackup && ! lastGoodBackup && ! isLoading && ! disabled && (
				<div>{ translate( 'There are no recent backups for your site.' ) }</div>
			) }
			{ ( ( isLoading && ! hasRetrievedLastBackup ) || disabled ) && (
				<>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder is-large"></div>
				</>
			) }
		</Card>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	return {
		gmtOffset: getSiteGmtOffset( state, siteId ),
		lastGoodBackup: getLastGoodRewindBackup( state, siteId ),
		siteId,
		timezone: getSiteTimezoneValue( state, siteId ),
	};
};

const mapDispatchToPros = {
	requestBackups: requestRewindBackups,
};

export default compose(
	connect( mapStateToProps, mapDispatchToPros ),
	withLocalizedMoment,
	localize
)( SiteBackupCard );
