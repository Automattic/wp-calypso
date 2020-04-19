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
import FoldableCard from 'components/foldable-card';
import { Button } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import QueryMediaStorage from 'components/data/query-media-storage';
import QueryMediaExport from 'components/data/query-media-export';
import getMediaExportUrl from 'state/selectors/get-media-export-url';
import getMediaStorageUsed from 'state/selectors/get-media-storage-used';
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

		const hasNoMediaFiles = this.props.mediaStorageUsed === 0 && ! mediaExportUrl;

		const exportMediaButton = (
			<Button
				href={ mediaExportUrl }
				className="export-media-card__download"
				disabled={ ! mediaExportUrl }
				onClick={ recordMediaExportClick }
			>
				{ hasNoMediaFiles ? translate( 'Upload files first' ) : translate( 'Download' ) }
			</Button>
		);

		return (
			<div className="export-media-card">
				<QueryMediaStorage siteId={ siteId } />
				{ ! hasNoMediaFiles && <QueryMediaExport siteId={ siteId } /> }
				<FoldableCard
					header={
						<div>
							<h1 className="export-media-card__title">{ translate( 'Export media library' ) }</h1>
							<h2 className="export-media-card__subtitle">
								{ translate(
									'Download all the media library files (images, videos, audio and documents) from your site.'
								) }
							</h2>
						</div>
					}
					summary={ exportMediaButton }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		mediaExportUrl: getMediaExportUrl( state ),
		mediaStorageUsed: getMediaStorageUsed( state, getSelectedSiteId( state ) ),
	} ),
	{
		recordMediaExportClick: () => recordTracksEvent( 'calypso_export_media_download_button_click' ),
	}
)( localize( ExportMediaCard ) );
