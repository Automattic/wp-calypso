/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { get, flow } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { appStates } from 'state/imports/constants';
import { cancelImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { deselectImporterOption } from 'state/ui/importers/actions';
import { getImporterOption } from 'state/ui/importers/selectors';

export class CloseButton extends React.PureComponent {
	static displayName = 'CloseButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string,
			importerState: PropTypes.string,
			type: PropTypes.string,
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
			importerOption,
		} = this.props;

		const tracksType = ( type || importerOption ).endsWith( 'site-importer' )
			? type + '-wix'
			: type;

		this.props.deselectImporterOption();
		cancelImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_cancel_clicked', {
			blog_id: siteId,
			importer_id: tracksType,
		} );
	};

	render() {
		const {
			isEnabled,
			isUploading,
			translate,
		} = this.props;

		const disabled = ! isEnabled || isUploading || appStates.UPLOADING === importerState;

		return (
			<Button
				className="importer-header__action-button"
				disabled={ disabled }
				isPrimary
				scary
				onClick={ this.handleClick }
			>
				{ translate( 'Close', { context: 'verb, to Close a dialog' } ) }
			</Button>
		);
	}
}

export default flow(
	connect(
		state => ( {
			importerOption: getImporterOption( state ),
			isUploading: get( state, 'imports.uploads.inProgress' ),
		} ),
		{
			deselectImporterOption,
			recordTracksEvent,
		}
	),
	localize
)( CloseButton );
