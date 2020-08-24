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

class Shortcodes extends Component {
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
						'Shortcodes are WordPress-specific markup that let you add media from popular sites. This feature is no longer necessary as the editor now handles media embeds rather gracefully.'
					) }
					link="https://jetpack.com/support/shortcode-embeds/"
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
}

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
		afterTheDeadlineModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'shortcodes' ),
		moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Shortcodes ) );
