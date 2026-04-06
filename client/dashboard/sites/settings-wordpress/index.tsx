import {
	siteBySlugQuery,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canViewWordPressSettings } from '../features';
import { BetaProgramNotice } from './beta-program-notice';
import { LatestVersionNotice } from './latest-version-notice';
import { useVersionSwitch } from './use-version-switch';
import { VersionForm } from './version-form';
import { VersionSwitchNotice } from './version-switch-notice';

function WordPressSettingsForm( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: currentVersion } = useQuery( siteWordPressVersionQuery( site.ID ) );
	const versionSwitch = useVersionSwitch( site );
	const { isSwitching, switchedToBeta, switchedToLatest, backupState, targetVersion } =
		versionSwitch;

	// Resolve the target version tag (e.g. "beta") to a display string (e.g. "7.0-RC2").
	const { data: latestVersion = '' } = useQuery( wpOrgCoreVersionQuery() );
	const { data: betaVersion = '' } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );

	let notice;
	if ( isSwitching ) {
		// Switching in progress — show backup/progress notices.
		notice = (
			<VersionSwitchNotice
				backupState={ backupState }
				targetVersion={ targetVersion === 'beta' ? betaVersion : latestVersion }
			/>
		);
	} else if ( switchedToLatest ) {
		// Just switched back to stable.
		notice = <LatestVersionNotice wpVersion={ latestVersion } />;
	} else if ( switchedToBeta || currentVersion === 'beta' ) {
		// Enrolled in beta — show program notice.
		notice = <BetaProgramNotice site={ site } wpVersion={ betaVersion } />;
	}

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
			notices={ notice }
		>
			<VersionForm
				site={ site }
				currentVersion={ currentVersion }
				versionSwitch={ versionSwitch }
			/>
		</PageLayout>
	);
}

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( canViewWordPressSettings( site ) ) {
		return <WordPressSettingsForm siteSlug={ siteSlug } />;
	}

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
		</PageLayout>
	);
}
