import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import privateSiteGraphic from 'calypso/assets/images/blaze/site-private-graphic@3x.png';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function BlazePrivateSite() {
	const selectedSiteData = useSelector( getSelectedSite );
	const siteSlug = selectedSiteData?.slug;

	const translate = useTranslate();

	return (
		<>
			<div className="promote-post-i2__inner-container">
				<div className="promote-post-i2__setup-icon">
					<img src={ privateSiteGraphic } alt="privete site graphic" />
				</div>
				<h3 className="setup-pages__title wp-brand-font">
					{ translate( 'Make sure your site is public' ) }
				</h3>
				<p className="empty-promotion-list__body">
					{ translate( 'Go to your WordPress.com dashboard and follow stapes below.' ) }
				</p>

				<ul className="promote-post-i2__active-steps">
					<li>
						<span>1</span>
						<div>
							{ translate( 'Navigate to {{a}}Settings{{/a}} → General or click here', {
								components: {
									a: (
										<a
											href={ `https://wordpress.com/settings/general/${ siteSlug }#site-privacy-settings` }
											target="_blank"
											rel="noreferrer"
										/>
									),
								},
							} ) }
						</div>
					</li>
					<li>
						<span>2</span>
						<div>{ translate( 'Locate “Launch site” or “Privacy” section' ) }</div>
					</li>
					<li>
						<span>3</span>
						<div>{ translate( 'Click "Launch" button or switch site to "Public"' ) }</div>
					</li>
				</ul>
				<p className="promote-post-i2__footer-text">
					{ translate( 'Read more on how to launch your site {{a}}here{{/a}}. ', {
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/privacy-settings/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					} ) }
				</p>
			</div>
		</>
	);
}
