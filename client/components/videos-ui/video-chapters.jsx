import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import moment from 'moment';

const VideoChapters = ( {
	course,
	isChapterSelected,
	onChapterSelected,
	translate,
	onVideoPlayClick,
	isPreloadAnimationState,
} ) => {
	return Object.entries( course?.videos ).map( ( data, i ) => {
		const isVideoCompleted = data[ 0 ] in course.completions && course.completions[ data[ 0 ] ];
		const videoInfo = data[ 1 ];

		return (
			<div
				key={ i }
				className={ classNames( 'videos-ui__chapter', {
					selected: isChapterSelected( i ),
					preload: isPreloadAnimationState,
				} ) }
			>
				<button
					type="button"
					className="videos-ui__chapter-accordion-toggle"
					onClick={ () => onChapterSelected( i ) }
				>
					<span className="videos-ui__video-title">
						{ i + 1 }. { videoInfo.title }{ ' ' }
					</span>
					<span className="videos-ui__duration">
						{ moment.unix( videoInfo.duration_seconds ).format( 'm:ss' ) }
					</span>
					{ isVideoCompleted && (
						<span className="videos-ui__completed-checkmark">
							<Gridicon icon="checkmark" size={ 12 } />
						</span>
					) }
					{ isChapterSelected( i ) && ! isVideoCompleted && (
						<span className="videos-ui__status-icon">
							<Gridicon icon="chevron-up" size={ 18 } />
						</span>
					) }
					{ ! isChapterSelected( i ) && ! isVideoCompleted && (
						<span className="videos-ui__status-icon">
							<Gridicon icon="chevron-down" size={ 18 } />
						</span>
					) }
				</button>
				<div className="videos-ui__active-video-content">
					<div>
						<p>{ videoInfo.description } </p>
						<Button
							className={ classNames( 'videos-ui__button', {
								'videos-ui__video-completed': isVideoCompleted,
							} ) }
							onClick={ () => onVideoPlayClick( data[ 0 ], videoInfo ) }
						>
							<svg
								width="12"
								height="14"
								viewBox="0 0 12 14"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M1.9165 1.75L10.0832 7L1.9165 12.25V1.75Z"
									fill="#101517"
									stroke="#101517"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span>{ translate( 'Play video' ) }</span>
						</Button>
					</div>
				</div>
			</div>
		);
	} );
};

export default VideoChapters;
