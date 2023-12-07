import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import './style.scss';

export default function Overview() {
	const translate = useTranslate();

	return (
		<Main className="manage-overview">
			<DocumentHead title={ translate( 'Overview' ) } />
			<div className="welcome-section">
				<h1>Welcome to Jetpack Manage 👋</h1>
				<p>
					Jetpack Manage helps you to monitor security and performance across all of your sites in a
					single place.
				</p>
				<ul className="benefits-list">
					<li>Insights: traffic and real-time uptime stats.</li>
					<li>Plugin Updates: bulk update plugins in one click.</li>
					<li>Backups & Scans: safeguard your sites and data.</li>
					<li>Boost: manage performance across all of your sites.</li>
				</ul>
				<button className="next-button">Next</button>
			</div>

			<section className="next-steps">
				<h2>Next steps</h2>
				<ol className="steps-list">
					<li>Get familiar with the sites management dashboard</li>
					<li>Learn how to add new sites</li>
					<li>Learn bulk editing and enabling downtime monitoring</li>
					<li>Explore plugin management</li>
				</ol>
			</section>

			<section className="jetpack-products">
				<h2>Jetpack products</h2>
				<p>Purchase single products or save big when you buy in bulk.</p>
			</section>
		</Main>
	);
}
