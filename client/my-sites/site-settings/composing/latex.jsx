/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SupportInfo from 'components/support-info';
import { Card } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';

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
