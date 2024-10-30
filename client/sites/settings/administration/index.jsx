import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SiteTools from '../../../my-sites/site-settings/site-tools';
import { SOURCE_SETTINGS_ADMINISTRATION } from '../../../my-sites/site-settings/site-tools/utils';

export default function AdministrationSettings() {
	const translate = useTranslate();
	const isWpcomStagingSite = useSelector( ( state ) =>
		isSiteWpcomStaging( state, getSelectedSiteId( state ) )
	);
	const slug = useSelector( getSelectedSiteSlug );

	return (
		<div className="administration-settings">
			{ ! isWpcomStagingSite && (
				<SiteTools
					headerTitle={ translate( 'Administration' ) }
					source={ SOURCE_SETTINGS_ADMINISTRATION }
				/>
			) }
			{ isWpcomStagingSite && (
				<div>
					<SettingsSectionHeader title={ translate( 'Administration' ) } />
					<CompactCard>
						<p>
							{ translate( 'Manage staging sites from the {{a}}staging dashboard{{/a}}.', {
								components: {
									a: <a href={ `/staging-site/${ slug }` } />,
								},
							} ) }
						</p>
					</CompactCard>
				</div>
			) }
		</div>
	);
}
