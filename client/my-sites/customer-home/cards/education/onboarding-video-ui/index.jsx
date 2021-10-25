import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

const OnboardingVideoUi = () => {
	const translate = useTranslate();

	return (
		<div className="onboarding-video-ui">
			<div className="onboarding-video-ui__header">
				<div className="onboarding-video-ui__header-links">
					<div>
						<Gridicon icon="my-sites" size={ 24 } />
						<a href="/" className="onboarding-video-ui__back-link">
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
					<div>
						<a href="/" className="onboarding-video-ui__skip-link">
							{ translate( 'Skip and draft first post' ) }
						</a>
					</div>
				</div>
				<div className="onboarding-video-ui__header-content">
					<div className="onboarding-video-ui__titles">
						<h2>{ translate( 'Watch five videos.' ) }</h2>
						<h2>{ translate( 'Save yourself hours.' ) }</h2>
					</div>
					<div className="onboarding-video-ui__summary">
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
			<div className="onboarding-video-ui__body">
				<div className="onboarding-video-ui__body-title">
					<h3>{ translate( 'Blogger Masterclass' ) }</h3>
				</div>
				<div className="onboarding-video-ui__video-content">
					<div className="onboarding-video-ui__video">
						<img src="https://placekitten.com/720/480" alt="placeholder" />
					</div>
					<div className="onboarding-video-ui__chapters">
						<div className="onboarding-video-ui__chapter">
							1. { translate( 'Set up your blog in 5 steps' ) }{ ' ' }
							<span className="onboarding-video-ui__duration">01:45</span>{ ' ' }
							<span className="onboarding-video-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
						</div>
						<div className="onboarding-video-ui__chapter">
							2. { translate( 'Write a blog post' ) }{ ' ' }
							<span className="onboarding-video-ui__duration">02:55</span>{ ' ' }
							<span className="onboarding-video-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
						</div>
						<div className="onboarding-video-ui__chapter">
							3. { translate( 'How to edit in Wordpress' ) }{ ' ' }
							<span className="onboarding-video-ui__duration">01:14</span>{ ' ' }
							<span className="onboarding-video-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
						</div>
						<div className="onboarding-video-ui__chapter">
							4. { translate( 'Social icons' ) }{ ' ' }
							<span className="onboarding-video-ui__duration">03:18</span>{ ' ' }
							<span className="onboarding-video-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
						</div>
						<div className="onboarding-video-ui__chapter">
							5. { translate( 'Add images to your posts' ) }{ ' ' }
							<span className="onboarding-video-ui__duration">02:20</span>{ ' ' }
							<span className="onboarding-video-ui__completed">
								<Gridicon icon="checkmark" size={ 12 } />
							</span>
							<div className="onboarding-video-ui__active-video-content">
								<p>
									{ translate(
										"You're about to embark on the journey of starting a new blog. We'll run through five steps to make sure that you love the way your blog looks so you can feel proud to share it with others."
									) }{ ' ' }
								</p>
								<button type="button" className="onboarding-video-ui__play-button">
									<Gridicon icon="play" size={ 12 } />
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

export default OnboardingVideoUi;
