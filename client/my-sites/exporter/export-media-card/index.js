/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
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
		const {
			mediaExportUrl,
			hasNoMediaFiles,
			siteId,
			translate,
			recordMediaExportClick,
		} = this.props;

		const exportMediaButton = (
			<Button
				href={ mediaExportUrl }
				className="export-media-card__download"
				disabled={ ! mediaExportUrl }
				onClick={ recordMediaExportClick }
			>
				{ translate( 'Download' ) }
			</Button>
		);

		return (
			<Fragment>
				<QueryMediaStorage siteId={ siteId } />
				{ ! hasNoMediaFiles && (
					<div className="export-media-card">
						<QueryMediaExport siteId={ siteId } />
						<FoldableCard
							header={
								<div>
									<h1 className="export-media-card__title">
										{ translate( 'Export media library' ) }
									</h1>
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
				) }
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		mediaExportUrl: getMediaExportUrl( state ),
		hasNoMediaFiles: getMediaStorageUsed( state, getSelectedSiteId( state ) ) === 0,
	} ),
	{
		recordMediaExportClick: () => recordTracksEvent( 'calypso_export_media_download_button_click' ),
	}
)( localize( ExportMediaCard ) );
