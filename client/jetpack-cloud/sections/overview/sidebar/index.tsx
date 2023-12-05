import './style.scss';

export default function OverviewSidebar() {
	return (
		<>
			<section className="intro-video">
				<div className="video-placeholder"></div>
				<p>Intro video</p>
				Watch a short intro video
			</section>
			<section className="quick-links">
				<h3>Quick links</h3>
				<ul>
					<li>
						<div className="icon-placeholder"></div>
						Manage all sites{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						Add sites to Jetpack Manage{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						Manage plugins{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						View all licenses{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						View billing{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						View invoices{ ' ' }
					</li>
					<li>
						<div className="icon-placeholder"></div>
						View prices{ ' ' }
					</li>
				</ul>
			</section>
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
