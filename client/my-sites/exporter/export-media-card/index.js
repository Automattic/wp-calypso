/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionCard from 'components/action-card';
import QueryMediaExport from 'components/data/query-media-export';
import getMediaExportUrl from 'state/selectors/get-media-export-url';
import { recordTracksEvent } from 'state/analytics/actions';

class ExportMediaCard extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		mediaExportUrl: PropTypes.string,
		recordMediaExportClick: PropTypes.func,
		translate: PropTypes.func,
	};

	render() {
		const { mediaExportUrl, siteId, translate } = this.props;

		return (
			<div className="export-media-card">
				<QueryMediaExport siteId={ siteId } />
				<ActionCard
					className="export-media-card__content export-card"
					headerText={ translate( 'Export media library' ) }
					mainText={ translate( 'Click the button to download your entire media library.' ) }
					buttonText={ translate( 'Download' ) }
					buttonPrimary={ true }
					buttonHref={ mediaExportUrl }
					buttonDisabled={ ! mediaExportUrl }
					buttonOnClick={ this.props.recordMediaExportClick }
					compact={ false }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		mediaExportUrl: getMediaExportUrl( state ),
	} ),
	dispatch => ( {
		recordMediaExportClick: () =>
			dispatch( recordTracksEvent( 'calypso_export_media_download_button_click' ) ),
	} )
)( localize( ExportMediaCard ) );
