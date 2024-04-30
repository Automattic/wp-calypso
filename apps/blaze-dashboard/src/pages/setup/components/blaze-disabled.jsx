import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function BlazeDisabled() {
	const selectedSiteData = useSelector( getSelectedSite );
	const adminUrl = selectedSiteData?.options?.admin_url;

	const translate = useTranslate();

	return (
		<>
			<h3 className="empty-promotion-list__title wp-brand-font">
				{ translate( 'Set up Blaze and start promoting your store' ) }
			</h3>
			<p className="empty-promotion-list__body">
				{ translate(
					"You're on the brink of unleashing the advertising potential of your store. To get started, follow these simple steps below:"
				) }
			</p>

			<ol className="promote-post-i2__active-steps">
				<li>
					{ translate( 'Go to the {{a}}traffic section{{/a}} of the Jetpack settings page.', {
						components: {
							a: (
								<a
									href={ `${ adminUrl }/admin.php?page=jetpack#/traffic` }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					} ) }
				</li>
				<li>{ translate( 'Scroll down to the Blaze section and toggle it to active.' ) }</li>
			</ol>
			<p className="empty-promotion-list__body">
				{ translate(
					"After completing these steps, you're all set! Return here, refresh the page and start promoting your store with Blaze!"
				) }
			</p>
		</>
	);
}
