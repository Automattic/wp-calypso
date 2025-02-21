import './styles.scss';

interface NewsletterWidgetProps {
	hostname: string;
}

export const NewsletterWidget = ( { hostname }: NewsletterWidgetProps ) => {
	return (
		<div className="newsletter-widget__footer">
			<p>
				Effortlessly turn posts into emails with our Newsletter feature-expand your reach, engage
				readers, and monetize your writing. No coding required.
				<a href="https://wordpress.com/learn/courses/newsletters-101/wordpress-com-newsletter/">
					Learn more
				</a>
			</p>
			<div>
				<h3>Quick Links</h3>
				<ul>
					<li>
						<a href="edit.php">Publish your next post</a>
					</li>
					<li>
						<a href={ `https://wordpress.com/stats/subscribers/${ hostname }` }>
							View subscriber stats
						</a>
					</li>
					<li>
						<a href={ `https://wordpress.com/subscribers/${ hostname }` }>Import subscribers</a>
					</li>
					<li>
						<a href={ `https://wordpress.com/subscribers/${ hostname }` }>Manage subscribers</a>
					</li>
					<li>
						<a href={ `https://wordpress.com/earn/${ hostname }` }>Monetize</a>
					</li>
					<li>
						<a href={ `https://wordpress.com/settings/newsletter/${ hostname }` }>
							Newsletter settings
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
};
