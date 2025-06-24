import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import videoThumbnail2x from 'calypso/assets/images/jetpack/getting-started-backup-video-thumbnail-2x.png';
import videoThumbnail from 'calypso/assets/images/jetpack/getting-started-backup-video-thumbnail.png';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import './style.scss';
import { GETTING_STARTED_WITH_JETPACK_BACKUP_VIDEO_URL } from './consts';

type VideoPreviewProps = {
	srcs: [ string ] | [ string, string ];
	description: string;
	timeLength: string;
	hiddenOn?: 'desktop' | 'mobile';
};
const VideoPreview = ( { srcs, description, timeLength, hiddenOn }: VideoPreviewProps ) => (
	<div className="backup-getting-started__preview" data-hidden={ hiddenOn }>
		<img
			className="backup-getting-started__image"
			src={ srcs[ 0 ] }
			srcSet={ srcs.length > 1 ? `${ srcs[ 0 ] } 1x, ${ srcs[ 1 ] } 2x` : undefined }
			alt={ description }
		/>
		<span className="backup-getting-started__time-length">{ timeLength }</span>
	</div>
);

export default function BackupGettingStarted() {
	const translate = useTranslate();
	const videoPreviewProps: VideoPreviewProps = {
		srcs: [ videoThumbnail, videoThumbnail2x ],
		description: translate( 'Getting started with Jetpack VaultPress Backup video thumbnail', {
			textOnly: true,
		} ),
		timeLength: '2:55',
	};

	return (
		<DismissibleCard preferenceName="backup-getting-started" className="backup-getting-started">
			<VideoPreview { ...videoPreviewProps } hiddenOn="mobile" />
			<div className="backup-getting-started__content">
				<h2 className="backup-getting-started__header">
					{ translate( 'Getting started with Jetpack VaultPress Backup' ) }
				</h2>
				<p className="backup-getting-started__text">
					{ translate(
						'A short video guide covering the basics of backing up your website and restoring your website from a previous backup.'
					) }
				</p>
				<VideoPreview { ...videoPreviewProps } hiddenOn="desktop" />
				<Button
					target="_blank"
					className="backup-getting-started__button"
					href={ GETTING_STARTED_WITH_JETPACK_BACKUP_VIDEO_URL }
					onClick={ () =>
						recordTracksEvent( 'calypso_jetpack_backup_getting_started_video_click' )
					}
					primary
				>
					{ translate( 'Watch the video' ) }
				</Button>
			</div>
		</DismissibleCard>
	);
}
