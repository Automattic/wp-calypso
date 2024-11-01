import { useTranslate } from 'i18n-calypso';
import SiteTools from '../../../my-sites/site-settings/site-tools';
import { SOURCE_SETTINGS_ADMINISTRATION } from '../../../my-sites/site-settings/site-tools/utils';

export default function AdministrationSettings() {
	const translate = useTranslate();

	return (
		<div className="administration-settings">
			<SiteTools
				headerTitle={ translate( 'Administration' ) }
				source={ SOURCE_SETTINGS_ADMINISTRATION }
			/>
		</div>
	);
}
