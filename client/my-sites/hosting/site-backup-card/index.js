/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import isRequestingRewindBackups from 'state/selectors/is-requesting-rewind-backups';
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
	isRequestingBackups,
	lastGoodBackup,
	moment,
	requestBackups,
	siteId,
	timezone,
	translate,
} ) => {
	useEffect( () => {
		if ( ! disabled && lastGoodBackup === null && ! isRequestingBackups ) {
			requestBackups( siteId );
		}
	}, [ disabled, lastGoodBackup, isRequestingBackups, siteId ] );

	const lastGoodBackupTime = lastGoodBackup
		? applySiteOffset( moment.utc( lastGoodBackup.last_updated, 'YYYY-MM-DD hh:mma' ), {
				timezone,
				gmtOffset,
		  } )
		: null;

	return (
		<Card className={ classNames( 'site-backup-card', { [ 'is-disabled' ]: disabled } ) }>
			<CardHeading>{ translate( 'Site backup' ) }</CardHeading>
			{ lastGoodBackup && ! isRequestingBackups && ! disabled && (
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
			{ ! lastGoodBackup && ! isRequestingBackups && ! disabled && (
				<div>{ translate( 'There are no recent backups for your site.' ) }</div>
			) }
			{ ( isRequestingBackups || disabled ) && (
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
		isRequestingBackups: isRequestingRewindBackups( state, siteId ),
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
