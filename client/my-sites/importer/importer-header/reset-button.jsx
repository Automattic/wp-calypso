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
import Button from 'components/forms/form-button';
import { appStates } from 'state/imports/constants';
import { clearImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export class ResetButton extends React.PureComponent {
	static displayName = 'ResetButton';

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

		clearImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_reset_clicked', {
			blog_id: siteId,
			importer_id: tracksType,
		} );
	};

	render() {
		const {
			importerStatus: { importerState },
			isEnabled,
			translate,
		} = this.props;

		const disabled = ! isEnabled || appStates.UPLOADING === importerState;

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
		null,
		{ recordTracksEvent }
	),
	localize
)( ResetButton );
