import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function Shortcodes( {
	isRequestingSettings,
	isSavingSettings,
	moduleUnavailable,
	selectedSiteId,
	translate,
	isAtomic,
} ) {
	return (
		<Card className="composing__card site-settings__card">
			<QueryJetpackConnection siteId={ selectedSiteId } />
			<SupportInfo
				text={ translate(
					'Shortcodes are WordPress-specific markup that let you add media from popular sites. This feature is no longer necessary as the editor now handles media embeds rather gracefully.'
				) }
				link={
					isAtomic
						? localizeUrl( 'https://wordpress.com/support/shortcodes/' )
						: 'https://jetpack.com/support/shortcode-embeds/'
				}
				privacyLink={ ! isAtomic }
			/>
			<JetpackModuleToggle
				siteId={ selectedSiteId }
				moduleSlug="shortcodes"
				label={ translate( 'Compose using shortcodes to embed media from popular sites' ) }
				disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable }
			/>
		</Card>
	);
}

Shortcodes.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
};

Shortcodes.propTypes = {
	isAtomic: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'shortcodes'
	);

	return {
		selectedSiteId,
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Shortcodes ) );
