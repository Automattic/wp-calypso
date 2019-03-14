/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { get, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import ImporterLogo from 'my-sites/importer/importer-logo';
import StartButton from 'my-sites/importer/importer-header/start-button';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ];

class ImporterHeader extends React.PureComponent {
	static displayName = 'ImporterHeader';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		description: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { importerStatus, icon, title, description, site } = this.props;
		const { importerState } = importerStatus;
		const showStartButton = includes( startStates, importerState );

		return (
			<header className="importer-header">
				<ImporterLogo icon={ icon } />
				{ showStartButton && <StartButton importerStatus={ importerStatus } site={ site } /> }
				<div className="importer-header__service-info">
					<h1 className="importer-header__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
}

export default connect(
	state => ( {
		isUploading: get( state, 'imports.uploads.inProgress' ),
	} ),
	{ recordTracksEvent }
)( localize( ImporterHeader ) );
