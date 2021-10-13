import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class Latex extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		handleToggle: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			moduleUnavailable,
			selectedSiteId,
			translate,
		} = this.props;

		return (
			<Card className="composing__card site-settings__card">
				<QueryJetpackConnection siteId={ selectedSiteId } />
				<SupportInfo
					text={ translate(
						'LaTeX is a powerful markup language for writing complex mathematical equations and formulas.'
					) }
					link="https://jetpack.com/support/beautiful-math/"
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
}

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
		afterTheDeadlineModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'latex' ),
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Latex ) );
