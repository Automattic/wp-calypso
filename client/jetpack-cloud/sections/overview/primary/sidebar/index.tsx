import GetHelpNav from '../get-help-nav';
import QuickLinksNav from '../quick-links-nav';
import './style.scss';

export default function OverviewSidebar() {
	return (
		<>
			<section className="intro-video">
				<div className="video-placeholder"></div>
				<p>Intro video</p>
				Watch a short intro video
			</section>
			<QuickLinksNav />
			<GetHelpNav />
		</>
	);
}
