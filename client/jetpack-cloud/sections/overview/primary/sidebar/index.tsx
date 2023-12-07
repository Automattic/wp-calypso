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
			<section className="get-help">
				<h3>Get help</h3>
				<ul>
					<li> Get started guide </li>
					<li> All sites management </li>
					<li> Issuing, assigning, and revoking licenses </li>
					<li> Billing/payment FAQs </li>
					<li> Managing plugins </li>
				</ul>
				<div className="button-placeholder">Contact support</div>
				Provide product feedback
			</section>
		</>
	);
}
