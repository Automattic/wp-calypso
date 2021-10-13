import { connect } from 'react-redux';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SiteTools from './site-tools';

const SiteSettingsGeneral = ( { site } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		<SiteTools />
	</div>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( SiteSettingsGeneral );
