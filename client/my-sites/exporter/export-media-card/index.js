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
			<div className="export-media-card">
				<QueryMediaExport siteId={ siteId } />
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
	} ),
	{
		recordMediaExportClick: () => recordTracksEvent( 'calypso_export_media_download_button_click' ),
	}
)( localize( ExportMediaCard ) );
