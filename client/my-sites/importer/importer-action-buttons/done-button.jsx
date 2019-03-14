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
import { resetImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { setImportOriginSiteDetails } from 'state/importer-nux/actions';
import { SITE_IMPORTER } from 'state/imports/constants';

export class DoneButton extends React.PureComponent {
	static displayName = 'DoneButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = () => {
		const {
			importerStatus: { importerId, type },
			site: { ID: siteId },
		} = this.props;
		const tracksType = type.endsWith( 'site-importer' ) ? type + '-wix' : type;

		resetImport( siteId, importerId );

		if ( SITE_IMPORTER === type ) {
			// Clear out site details, so that importers list isn't filtered
			this.props.setImportOriginSiteDetails();
		}

		this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: siteId,
			importer_id: tracksType,
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<ImporterActionButton primary onClick={ this.handleClick }>
				{ translate( 'Done', { context: 'adjective' } ) }
			</ImporterActionButton>
		);
	}
}

export default flow(
	connect(
		null,
		{ setImportOriginSiteDetails, recordTracksEvent }
	),
	localize
)( DoneButton );
