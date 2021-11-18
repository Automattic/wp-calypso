import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryMediaExport from 'calypso/components/data/query-media-export';
import QueryMediaStorage from 'calypso/components/data/query-media-storage';
import FoldableCard from 'calypso/components/foldable-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getMediaExportUrl from 'calypso/state/selectors/get-media-export-url';
import getMediaStorageUsed from 'calypso/state/selectors/get-media-storage-used';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
									<h2 className="export-media-card__warning">
										{ translate(
											'Depending on your media library size and/or connection speed you might need to use a download manager. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
											{
												components: {
													learnMoreLink: (
														<InlineSupportLink
															supportContext="export-media-library"
															showIcon={ false }
														/>
													),
												},
											}
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
