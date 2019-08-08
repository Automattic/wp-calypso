/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flow } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ImporterActionButton from './action-button';
import { appStates } from 'state/imports/constants';
import { cancelImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export class ImporterCloseButton extends React.PureComponent {
	static displayName = 'ImporterCloseButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			engine: PropTypes.string.isRequired,
			importerId: PropTypes.string.isRequired,
			importerState: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		isEnabled: PropTypes.bool.isRequired,
	};

	handleClick = () => {
		const {
			importerStatus: { engine, importerId },
			site: { ID: siteId },
		} = this.props;

		cancelImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_cancel_clicked', {
			blog_id: siteId,
			engine,
			importer_id: `importer-type-${ engine }`,
		} );
	};

	render() {
		const {
			importerStatus: { importerState },
			isEnabled,
			isUploading,
			translate,
		} = this.props;

		const disabled = ! isEnabled || isUploading || appStates.UPLOADING === importerState;

		return (
			<ImporterActionButton disabled={ disabled } onClick={ this.handleClick }>
				{ translate( 'Cancel', { context: 'verb, to Cancel an operation' } ) }
			</ImporterActionButton>
		);
	}
}

export default flow(
	connect(
		null,
		{ recordTracksEvent }
	),
	localize
)( ImporterCloseButton );
