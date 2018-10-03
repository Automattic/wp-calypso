/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionCard from 'components/action-card';
import QueryMediaExport from 'components/data/query-media-export';
import getMediaExportData from 'state/selectors/get-media-export-data';

class ExportMediaCard extends Component {
	render() {
		const { mediaExportData, siteId, translate } = this.props;
		const mediaExportUrl = mediaExportData.mediaExportUrl ? mediaExportData.mediaExportUrl : '';

		return (
			<Fragment>
				<QueryMediaExport siteId={ siteId } />
				<ActionCard
					headerText={ translate( 'Export Media Library' ) }
					mainText={ translate( 'Click the button to download your media library as an archive.' ) }
					buttonText={ translate( 'Download' ) }
					buttonPrimary={ true }
					buttonHref={ mediaExportUrl }
				/>
			</Fragment>
		);
	}
}

export default connect( state => ( {
	mediaExportData: getMediaExportData( state ),
} ) )( localize( ExportMediaCard ) );
