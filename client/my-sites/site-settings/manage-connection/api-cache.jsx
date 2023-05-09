import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { flowRight, pick } from 'lodash';
import { connect } from 'react-redux';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ApiCache = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	siteIsJetpack,
	translate,
} ) => {
	if ( ! config.isEnabled( 'jetpack/api-cache' ) || ! siteIsJetpack ) {
		return null;
	}

	return (
		<CompactCard>
			<ToggleControl
				checked={ !! fields.api_cache }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'api_cache' ) }
				label={
					<>
						{ translate( 'Use synchronized data to boost performance' ) }{ ' ' }
						<span>(a8c-only experimental feature)</span>
					</>
				}
			/>
		</CompactCard>
	);
};

const connectComponent = connect( ( state ) => ( {
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
} ) );

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'api_cache' ] );
};

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( ApiCache );
