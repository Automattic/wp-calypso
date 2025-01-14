import { WPCOM_FEATURES_BACKUPS, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	HostingCard,
	HostingCardHeading,
	HostingCardLinkButton,
} from 'calypso/components/hosting-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import getLastGoodRewindBackup from 'calypso/state/selectors/get-last-good-rewind-backup';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const SiteBackupCard = ( { lastGoodBackup, requestBackups, siteId, siteSlug } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const hasRetrievedLastBackup = lastGoodBackup !== null;
	const [ isLoading, setIsLoading ] = useState( false );

	const hasBackup = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);

	useEffect( () => {
		const shouldRequestLastBackup = hasBackup && ! hasRetrievedLastBackup && ! isLoading;
		if ( shouldRequestLastBackup ) {
			requestBackups( siteId );
			setIsLoading( true );
		}
	}, [ hasBackup, hasRetrievedLastBackup, isLoading, lastGoodBackup, requestBackups, siteId ] );

	useEffect( () => {
		if ( hasRetrievedLastBackup ) {
			setIsLoading( false );
		}
	}, [ hasRetrievedLastBackup ] );

	const lastGoodBackupTime = lastGoodBackup
		? moment.utc( lastGoodBackup.last_updated, 'YYYY-MM-DD hh:mma' ).local().format( 'LLL' )
		: null;

	const renderContent = () => {
		if ( ! hasBackup ) {
			return (
				<>
					<p>
						<strong>{ translate( "Your plan doesn't support backups!" ) }</strong>
					</p>
					<p>
						{ translate(
							'Unlock more granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
						) }
					</p>
					<Button
						href={ addQueryArgs( `/plans/${ siteSlug }`, {
							feature: WPCOM_FEATURES_BACKUPS,
							plan: PLAN_BUSINESS,
						} ) }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_hosting_overview_backups_upgrade_plan_click' ) )
						}
					>
						{ translate( 'Upgrade your plan' ) }
					</Button>
				</>
			);
		}

		if ( isLoading ) {
			return (
				<>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder"></div>
					<div className="site-backup-card__placeholder is-large"></div>
				</>
			);
		}

		if ( lastGoodBackup ) {
			return (
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
			);
		}

		return <div>{ translate( 'There are no recent backups for your site.' ) }</div>;
	};

	return (
		<HostingCard className="site-backup-card">
			<HostingCardHeading title={ translate( 'Site backup' ) }>
				{ hasBackup && (
					<HostingCardLinkButton
						to={ `/backup/${ siteSlug }` }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_overview_backups_see_all_click' ) )
						}
					>
						{ translate( 'See all backups' ) }
					</HostingCardLinkButton>
				) }
			</HostingCardHeading>
			{ renderContent() }
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
