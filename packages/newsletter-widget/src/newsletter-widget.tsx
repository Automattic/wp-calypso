import './style.scss';

interface NewsletterWidgetProps {
	hostname: string;
	adminUrl: string;
}

const WPCOM_BASE = 'https://wordpress.com';

export const NewsletterWidget = ( { hostname, adminUrl }: NewsletterWidgetProps ) => {
	return (
		<div className="newsletter-widget__footer">
			<p className="newsletter-widget__footer-msg">
				Effortlessly turn posts into emails with our Newsletter feature-expand your reach, engage
				readers, and monetize your writing. No coding required.{ ' ' }
				<a href={ `${ WPCOM_BASE }/learn/courses/newsletters-101/wordpress-com-newsletter/` }>
					Learn more
				</a>
			</p>
			<div>
				<h3>Quick Links</h3>
				<ul className="newsletter-widget__footer-list">
					<li>
						<a href={ `${ adminUrl }edit.php` }>Publish your next post</a>
					</li>
					<li>
						<a href={ `${ WPCOM_BASE }/stats/subscribers/${ hostname }` }>View subscriber stats</a>
					</li>
					<li>
						<a href={ `${ WPCOM_BASE }/subscribers/${ hostname }` }>Import subscribers</a>
					</li>
					<li>
						<a href={ `${ WPCOM_BASE }/subscribers/${ hostname }` }>Manage subscribers</a>
					</li>
					<li>
						<a href={ `${ WPCOM_BASE }/earn/${ hostname }` }>Monetize</a>
					</li>
					<li>
						<a href={ `${ WPCOM_BASE }/settings/newsletter/${ hostname }` }>Newsletter settings</a>
					</li>
				</ul>
			</div>
		</div>
	);
};
