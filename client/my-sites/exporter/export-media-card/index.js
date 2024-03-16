import { Button, FoldableCard } from '@automattic/components';
import { Site } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryMediaExport from 'calypso/components/data/query-media-export';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getMediaExportUrl from 'calypso/state/selectors/get-media-export-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function ExportMediaCard() {
	const siteId = useSelector( getSelectedSiteId );
	const mediaExportUrl = useSelector( getMediaExportUrl );
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const hasNoMediaFiles = mediaStorage?.storageUsedBytes === 0;
	const dispatch = useDispatch();
	const recordMediaExportClick = () =>
		dispatch( recordTracksEvent( 'calypso_export_media_download_button_click' ) );
	const translate = useTranslate();

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
										'Depending on your media library size and/or connection speed, you might need to use a download manager. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
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

export default ExportMediaCard;
