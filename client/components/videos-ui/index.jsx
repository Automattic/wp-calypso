import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

const VideosUi = () => {
	const translate = useTranslate();

	return (
		<div className="videos-ui">
			<div className="videos-ui__header">
				<div className="videos-ui__header-links">
					<div>
						<Gridicon icon="my-sites" size={ 24 } />
						<a href="/" className="videos-ui__back-link">
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
					<div>
						<a href="/" className="videos-ui__skip-link">
							{ translate( 'Skip and draft first post' ) }
						</a>
					</div>
				</div>
				<div className="videos-ui__header-content">
					<div className="videos-ui__titles">
						<h2>{ translate( 'Watch five videos.' ) }</h2>
						<h2>{ translate( 'Save yourself hours.' ) }</h2>
					</div>
					<div className="videos-ui__summary">
						<ul>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
								{ translate( 'Learn the basics of blogging' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
								{ translate( 'Familiarize yourself with Wordpress' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } /> { translate( 'Upskill and save hours' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
								{ translate( 'Set yourself up for blogging success' ) }
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className="videos-ui__body">
				<div className="videos-ui__body-title">
					<h3>{ translate( 'Blogger Masterclass' ) }</h3>
				</div>
				<div className="videos-ui__video-content">
					<div className="videos-ui__video">
						<img src="https://placekitten.com/720/480" alt="placeholder" />
					</div>
					<div className="videos-ui__chapters">
						<div className="videos-ui__chapter">
							<span className="videos-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							1. { translate( 'Set up your blog in 5 steps' ) }{ ' ' }
							<span className="videos-ui__duration">01:45</span>{ ' ' }
						</div>
						<div className="videos-ui__chapter">
							<span className="videos-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							2. { translate( 'Write a blog post' ) }{ ' ' }
							<span className="videos-ui__duration">02:55</span>{ ' ' }
						</div>
						<div className="videos-ui__chapter">
							<span className="videos-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							3. { translate( 'How to edit in Wordpress' ) }{ ' ' }
							<span className="videos-ui__duration">01:14</span>{ ' ' }
						</div>
						<div className="videos-ui__chapter">
							<span className="videos-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							4. { translate( 'Social icons' ) } <span className="videos-ui__duration">03:18</span>{ ' ' }
						</div>
						<div className="videos-ui__chapter active">
							<span className="videos-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							5. { translate( 'Add images to your posts' ) }{ ' ' }
							<span className="videos-ui__duration">02:20</span>{ ' ' }
							<div className="videos-ui__active-video-content">
								<p>
									{ translate(
										"You're about to embark on the journey of starting a new blog. We'll run through five steps to make sure that you love the way your blog looks so you can feel proud to share it with others."
									) }{ ' ' }
								</p>
								<button type="button" className="videos-ui__play-button">
									<Gridicon icon="play" size={ 24 } />
									{ translate( 'Play video' ) }
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideosUi;
