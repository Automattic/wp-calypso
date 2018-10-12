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
		recordMediaExportClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { mediaExportUrl, siteId, translate, recordMediaExportClick } = this.props;

		return (
			<div className="export-media-card">
				<QueryMediaExport siteId={ siteId } />
				<ActionCard
					className="export-media-card__content export-card"
					headerText={ translate( 'Export media library' ) }
					mainText={ translate(
						'Download your entire media library (images, videos, audios …) of your site.'
					) }
					buttonText={ translate( 'Download' ) }
					buttonHref={ mediaExportUrl }
					buttonDisabled={ ! mediaExportUrl }
					buttonOnClick={ recordMediaExportClick }
					compact={ false }
					buttonPrimary
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		mediaExportUrl: getMediaExportUrl( state ),
	} ),
	{
		recordMediaExportClick: () => recordTracksEvent( 'calypso_export_media_download_button_click' ),
	}
)( localize( ExportMediaCard ) );
