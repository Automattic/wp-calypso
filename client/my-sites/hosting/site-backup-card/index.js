/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import getLastGoodRewindBackup from 'state/selectors/get-last-good-rewind-backup';
import { requestRewindBackups } from 'state/rewind/backups/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';
import classNames from 'classnames';

const SiteBackupCard = ( {
	disabled,
	lastGoodBackup,
	moment,
	requestBackups,
	siteId,
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
		? moment
				.utc( lastGoodBackup.last_updated, 'YYYY-MM-DD hh:mma' )
				.local()
				.format( 'LLL' )
		: null;

	return (
		<Card className={ classNames( 'site-backup-card', { [ 'is-disabled' ]: disabled } ) }>
			<CardHeading>{ translate( 'Site backup' ) }</CardHeading>
			{ hasRetrievedLastBackup && lastGoodBackup && ! isLoading && ! disabled && (
				<>
					<p className="site-backup-card__date">
						{ translate( 'Last backup was on:' ) }
						<strong>{ lastGoodBackupTime }</strong>
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

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			lastGoodBackup: getLastGoodRewindBackup( state, siteId ),
			siteId,
		};
	},
	{
		requestBackups: requestRewindBackups,
	}
)( localize( SiteBackupCard ) );
