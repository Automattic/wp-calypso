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
import ActionButton from './action-button';
import { appStates } from 'state/imports/constants';
import { cancelImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export class CloseButton extends React.PureComponent {
	static displayName = 'CloseButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		isEnabled: PropTypes.bool.isRequired,
	};

	handleClick = () => {
		const {
			importerStatus: { importerId, type },
			site: { ID: siteId },
		} = this.props;
		const tracksType = type.endsWith( 'site-importer' ) ? type + '-wix' : type;

		cancelImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_cancel_clicked', {
			blog_id: siteId,
			importer_id: tracksType,
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
			<ActionButton disabled={ disabled } onClick={ this.handleClick }>
				{ translate( 'Cancel', { context: 'verb, to Close a dialog' } ) }
			</ActionButton>
		);
	}
}

export default flow(
	connect(
		null,
		{ recordTracksEvent }
	),
	localize
)( CloseButton );
