import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

export interface IntroVideo {
	id: string;
	title: string;
	durationLabel?: string;
	videoUrl?: string;
	posterImageUrl?: string;
}

interface Props {
	title: string;
	subtitle?: string;
	videos: IntroVideo[];
	dismissPreferenceKey: string;
	tracksEventPrefix: string;
}

export default function A4AIntroVideoStrip( {
	title,
	subtitle,
	videos,
	dismissPreferenceKey,
	tracksEventPrefix,
}: Props ) {
	const dispatch = useDispatch();
	const [ openVideo, setOpenVideo ] = useState< IntroVideo | null >( null );

	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreferenceKey ) );

	const onDismiss = useCallback( () => {
		dispatch( recordTracksEvent( `${ tracksEventPrefix }_dismiss` ) );
		dispatch( savePreference( dismissPreferenceKey, true ) );
	}, [ dispatch, dismissPreferenceKey, tracksEventPrefix ] );

	const onOpen = useCallback(
		( video: IntroVideo ) => {
			dispatch( recordTracksEvent( `${ tracksEventPrefix }_video_click`, { video_id: video.id } ) );
			setOpenVideo( video );
		},
		[ dispatch, tracksEventPrefix ]
	);

	const onClose = useCallback( () => {
		setOpenVideo( null );
	}, [] );

	if ( isDismissed ) {
		return null;
	}

	return (
		<>
			<VStack className="a4a-intro-video-strip" spacing={ 4 }>
				<HStack alignment="top" justify="space-between" spacing={ 4 }>
					<VStack spacing={ 1 }>
						<Text size={ 15 } weight={ 600 }>
							{ title }
						</Text>
						{ subtitle && <Text variant="muted">{ subtitle }</Text> }
					</VStack>
					<Button
						className="a4a-intro-video-strip__dismiss"
						icon={ close }
						label={ __( 'Dismiss' ) }
						onClick={ onDismiss }
					/>
				</HStack>
				<ul className="a4a-intro-video-strip__grid">
					{ videos.map( ( video ) => (
						<li key={ video.id }>
							<button
								type="button"
								className="a4a-intro-video-strip__card"
								onClick={ () => onOpen( video ) }
							>
								<div className="a4a-intro-video-strip__thumbnail">
									{ video.posterImageUrl && (
										<img
											src={ video.posterImageUrl }
											alt=""
											className="a4a-intro-video-strip__thumbnail-image"
										/>
									) }
								</div>
								<VStack spacing={ 0 } className="a4a-intro-video-strip__content">
									<Text weight={ 500 }>{ video.title }</Text>
									{ video.durationLabel && (
										<Text variant="muted" size={ 12 }>
											{ video.durationLabel }
										</Text>
									) }
								</VStack>
							</button>
						</li>
					) ) }
				</ul>
			</VStack>
			{ openVideo && <VideoModal video={ openVideo } onClose={ onClose } /> }
		</>
	);
}

function VideoModal( { video, onClose }: { video: IntroVideo; onClose: () => void } ) {
	return (
		<Modal
			title={ video.title }
			onRequestClose={ onClose }
			className="a4a-intro-video-strip__modal"
			size="large"
			isDismissible
		>
			<div className="a4a-intro-video-strip__player">
				{ video.videoUrl ? (
					<iframe
						src={ video.videoUrl }
						title={ video.title }
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						sandbox="allow-scripts allow-same-origin allow-presentation"
						allowFullScreen
					/>
				) : (
					<div className="a4a-intro-video-strip__player-placeholder">
						<Text variant="muted">{ __( 'Video preview coming soon.' ) }</Text>
					</div>
				) }
			</div>
		</Modal>
	);
}
