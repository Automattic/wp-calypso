import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import videoThumbnail2x from 'calypso/assets/images/jetpack/getting-started-backup-video-thumbnail-2x.png';
import videoThumbnail from 'calypso/assets/images/jetpack/getting-started-backup-video-thumbnail.png';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import { preventWidows } from 'calypso/lib/formatting';
import './style.scss';
import { GETTING_STARTED_WITH_JETPACK_BACKUP_VIDEO_URL } from './consts';

const VideoPreview = ( { srcs, description, timeLength, hiddenOn } ) => (
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
	const videoPreviewProps = {
		srcs: [ videoThumbnail, videoThumbnail2x ],
		description: translate( 'Getting started with Jetpack Backup video thumbnail' ),
		timeLength: '2:55',
	};

	return (
		<DismissibleCard preferenceName="backup-getting-started-1" className="backup-getting-started">
			<VideoPreview { ...videoPreviewProps } hiddenOn="mobile" />
			<div className="backup-getting-started__content">
				<h3 className="backup-getting-started__header">
					{ preventWidows( translate( 'Getting started with Jetpack Backup' ) ) }
				</h3>
				<p className="backup-getting-started__text">
					{ preventWidows(
						translate(
							'A short video guide covering the basics of backing up your website and restoring your website from a previous backup.'
						)
					) }
				</p>
				<VideoPreview { ...videoPreviewProps } hiddenOn="desktop" />
				<Button
					className="backup-getting-started__button"
					onClick={ () => window.open( GETTING_STARTED_WITH_JETPACK_BACKUP_VIDEO_URL ) }
					primary
				>
					{ translate( 'Watch a video' ) }
				</Button>
			</div>
		</DismissibleCard>
	);
}
