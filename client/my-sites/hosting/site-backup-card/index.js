import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	HostingCard,
	HostingCardHeading,
	HostingCardLinkButton,
} from 'calypso/components/hosting-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import getLastGoodRewindBackup from 'calypso/state/selectors/get-last-good-rewind-backup';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const SiteBackupCard = ( { disabled, lastGoodBackup, requestBackups, siteId, siteSlug } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const hasRetrievedLastBackup = lastGoodBackup !== null;
	const [ isLoading, setIsLoading ] = useState( false );
	const wpcomAdminInterface = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'wpcom_admin_interface' )
	);

	useEffect( () => {
		const shouldRequestLastBackup = ! disabled && ! hasRetrievedLastBackup && ! isLoading;
		if ( shouldRequestLastBackup ) {
			requestBackups( siteId );
			setIsLoading( true );
		}
	}, [ disabled, hasRetrievedLastBackup, isLoading, lastGoodBackup, requestBackups, siteId ] );

	useEffect( () => {
		if ( hasRetrievedLastBackup ) {
			setIsLoading( false );
		}
	}, [ hasRetrievedLastBackup ] );

	const lastGoodBackupTime = lastGoodBackup
		? moment.utc( lastGoodBackup.last_updated, 'YYYY-MM-DD hh:mma' ).local().format( 'LLL' )
		: null;

	return (
		<HostingCard className="site-backup-card">
			<HostingCardHeading title={ translate( 'Site backup' ) }>
				<HostingCardLinkButton
					to={
						wpcomAdminInterface === 'wp-admin'
							? `https://cloud.jetpack.com/backup/${ siteSlug }`
							: `/backup/${ siteSlug }`
					}
				>
					{ translate( 'See all backups' ) }
				</HostingCardLinkButton>
			</HostingCardHeading>
			{ hasRetrievedLastBackup && lastGoodBackup && ! isLoading && ! disabled && (
				<>
					<p className="site-backup-card__date">
						{ translate( 'Last backup was on:' ) }
						<strong>{ lastGoodBackupTime }</strong>
					</p>
					<p>
						{ translate(
							"If you restore your site using this backup, you'll lose any changes made after that date."
						) }
					</p>
				</>
			) }
			{ ( ( hasRetrievedLastBackup && ! lastGoodBackup && ! isLoading ) || disabled ) && (
				<div>{ translate( 'There are no recent backups for your site.' ) }</div>
			) }
			{ isLoading && ! hasRetrievedLastBackup && (
				<>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder is-large"></div>
				</>
			) }
		</HostingCard>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			lastGoodBackup: getLastGoodRewindBackup( state, siteId ),
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{
		requestBackups: requestRewindBackups,
	}
)( SiteBackupCard );
