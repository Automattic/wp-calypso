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

function Latex( {
	isAtomic,
	isRequestingSettings,
	isSavingSettings,
	moduleUnavailable,
	selectedSiteId,
	translate,
} ) {
	return (
		<Card className="composing__card site-settings__card">
			<QueryJetpackConnection siteId={ selectedSiteId } />
			<SupportInfo
				text={ translate(
					'LaTeX is a powerful markup language for writing complex mathematical equations and formulas.'
				) }
				link={
					isAtomic
						? localizeUrl( 'https://wordpress.com/support/latex/' )
						: 'https://jetpack.com/support/beautiful-math-with-latex/'
				}
				privacyLink={ ! isAtomic }
			/>
			<JetpackModuleToggle
				siteId={ selectedSiteId }
				moduleSlug="latex"
				label={ translate(
					'Use the LaTeX markup language to write mathematical equations and formulas'
				) }
				disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable }
			/>
		</Card>
	);
}

Latex.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
};

Latex.propTypes = {
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	isAtomic: PropTypes.bool,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'latex'
	);

	return {
		selectedSiteId,
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Latex ) );
