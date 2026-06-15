import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canOptOutOfWordPressBeta, canSwitchWordPressVersion } from '../features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { BetaOptOutButton } from './beta-opt-out-button';
import { BetaProgramNotice } from './beta-program-notice';
import { LatestVersionNotice } from './latest-version-notice';
import { useVersionSwitch } from './use-version-switch';
import { VersionForm } from './version-form';
import { VersionSwitchNotice } from './version-switch-notice';
import type { Site } from '@automattic/api-core';

function VersionManagement( { site }: { site: Site } ) {
	const { data: currentVersion } = useQuery( siteWordPressVersionQuery( site.ID ) );
	const versionSwitch = useVersionSwitch( site );
	const { isSwitching, switchedToBeta, switchedToLatest, backupState, targetVersion } =
		versionSwitch;

	// Resolve the target version tag (e.g. "beta") to a display string (e.g. "7.0-RC2").
	const { data: latestVersion = '' } = useQuery( wpOrgCoreVersionQuery() );
	const { data: betaVersion = '' } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );
	const versionsMatch = !! latestVersion && latestVersion === betaVersion;

	let notice;
	if ( versionsMatch ) {
		notice = null;
	} else if ( isSwitching ) {
		notice = (
			<VersionSwitchNotice
				backupState={ backupState }
				targetVersion={ targetVersion === 'beta' ? betaVersion : latestVersion }
			/>
		);
	} else if ( switchedToLatest ) {
		notice = <LatestVersionNotice wpVersion={ latestVersion } />;
	} else if ( switchedToBeta || currentVersion === 'beta' ) {
		notice = <BetaProgramNotice site={ site } wpVersion={ betaVersion } />;
	}

	return (
		<VStack spacing={ 6 }>
			{ notice }
			<VersionForm
				site={ site }
				currentVersion={ currentVersion }
				versionSwitch={ versionSwitch }
			/>
		</VStack>
	);
}

function BetaProgramContent( { site }: { site: Site } ) {
	const [ justOptedOut, setJustOptedOut ] = useState( false );
	const isEligible = canSwitchWordPressVersion( site ) || canOptOutOfWordPressBeta( site, 'beta' );
	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: isEligible,
	} );
	const { data: betaVersion = '' } = useQuery( {
		...wpOrgCoreVersionQuery( 'beta' ),
		enabled: isEligible,
	} );
	const { data: latestVersion = '' } = useQuery( {
		...wpOrgCoreVersionQuery(),
		enabled: isEligible,
	} );

	const versionsMatch = !! latestVersion && latestVersion === betaVersion;

	if ( justOptedOut && ! versionsMatch ) {
		return <LatestVersionNotice wpVersion={ latestVersion } />;
	}

	if ( canOptOutOfWordPressBeta( site, currentVersion ) && ! versionsMatch ) {
		return (
			<BetaProgramNotice
				site={ site }
				wpVersion={ betaVersion }
				actions={ <BetaOptOutButton site={ site } onSuccess={ () => setJustOptedOut( true ) } /> }
			/>
		);
	}

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.BACKUPS_SELF_SERVE }
			upsellId="site-settings-wordpress"
		>
			<VersionManagement site={ site } />
		</HostingFeatureGatedWithCallout>
	);
}

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const renderContent = () => {
		if ( isEnabled( 'dashboard/wp-beta-program' ) ) {
			return <BetaProgramContent site={ site } />;
		}

		if ( site.is_wpcom_staging_site ) {
			return <VersionManagement site={ site } />;
		}

		return (
			<Notice>
				<VStack>
					<Text as="p">
						{ sprintf(
							// translators: %s: WordPress version, e.g. 6.8
							__( 'Every WordPress.com site runs the latest WordPress version (%s).' ),
							getFormattedWordPressVersion( site )
						) }
					</Text>
					{ site.is_wpcom_atomic && (
						<Text as="p">
							{ createInterpolateElement(
								__(
									'Switch to a staging site to test a beta version of the next WordPress release. <learnMoreLink />'
								),
								{
									learnMoreLink: <InlineSupportLink supportContext="switch-to-staging-site" />,
								}
							) }
						</Text>
					) }
				</VStack>
			</Notice>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="WordPress"
					description={ __( 'Manage your WordPress version.' ) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
