import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, cloud } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import { Card, CardBody, CardHeader } from '../../components/card';
import { useFormattedTime } from '../../components/formatted-time';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import SiteBackupRestoreError from './error';
import SiteBackupRestoreForm from './form';
import SiteBackupGranularRestoreForm from './granular-form';
import SiteBackupRestoreProgress from './progress';
import SiteBackupRestoreSuccess from './success';

type RestoreStep = 'form' | 'progress' | 'success' | 'error';

function SiteBackupRestore() {
	const { siteSlug, rewindId } = siteBackupRestoreRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = siteSettings;
	const [ currentStep, setCurrentStep ] = useState< RestoreStep >( 'form' );
	const [ restoreId, setRestoreId ] = useState< number | null >( null );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { fileBrowserState } = useFileBrowserContext();
	const browserSelectedList = fileBrowserState.getSelectedList( Number( rewindId ) );
	const hasSelectedFiles = browserSelectedList.length > 0;
	const hasSelectedAllFiles = browserSelectedList[ 0 ]?.path === '//';

	const handleRestoreInitiate = ( newRestoreId: number ) => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_started' );
		setCurrentStep( 'progress' );
		setRestoreId( newRestoreId );
	};

	const handleRestoreComplete = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_completed' );
		setCurrentStep( 'success' );
		createSuccessNotice( __( 'Site restore completed.' ), {
			type: 'snackbar',
		} );
	};

	const handleRestoreError = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_failed' );
		setCurrentStep( 'error' );
	};

	const handleRetry = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_retry' );
		setCurrentStep( 'form' );
		setRestoreId( null );
	};

	const restorePointDate = useFormattedTime(
		new Date( parseFloat( rewindId ) * 1000 ).toISOString(),
		{
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset
	);

	const renderStep = () => {
		switch ( currentStep ) {
			case 'form':
				return hasSelectedFiles && ! hasSelectedAllFiles ? (
					<SiteBackupGranularRestoreForm
						siteId={ site.ID }
						onRestoreInitiate={ handleRestoreInitiate }
					/>
				) : (
					<SiteBackupRestoreForm siteId={ site.ID } onRestoreInitiate={ handleRestoreInitiate } />
				);
			case 'progress':
				return restoreId ? (
					<SiteBackupRestoreProgress
						site={ site }
						restoreId={ restoreId }
						onRestoreComplete={ handleRestoreComplete }
						onRestoreError={ handleRestoreError }
					/>
				) : null;
			case 'success':
				return <SiteBackupRestoreSuccess site={ site } restorePointDate={ restorePointDate } />;
			case 'error':
				return <SiteBackupRestoreError onRetry={ handleRetry } />;
		}
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Site restore' ) }
					description={ __( 'Restore your site to a previous point in time.' ) }
				/>
			}
		>
			{ currentStep !== 'success' ? (
				<Card>
					<CardHeader>
						<SectionHeader
							title={ __( 'Restore point' ) }
							level={ 3 }
							description={ createInterpolateElement(
								/* translators: %s is the date of the restore point */
								sprintf( __( '%(restorePointDate)s. <LearnMore />' ), {
									restorePointDate,
								} ),
								{
									LearnMore: isSelfHostedJetpackConnected( site ) ? (
										<ExternalLink
											href={ localizeUrl(
												'https://jetpack.com/support/backup/restoring-with-jetpack-backup/'
											) }
										>
											{ __( 'Learn more' ) }
										</ExternalLink>
									) : (
										<InlineSupportLink supportContext="backups">
											{ __( 'Learn more' ) }
										</InlineSupportLink>
									),
								}
							) }
							decoration={ <Icon icon={ cloud } /> }
						/>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 4 }>{ renderStep() }</VStack>
					</CardBody>
				</Card>
			) : (
				renderStep()
			) }
		</PageLayout>
	);
}

export default SiteBackupRestore;
