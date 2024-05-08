import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export default function IneligibleSite() {
	const translate = useTranslate();

	return (
		<>
			<div className="promote-post-i2__inner-container">
				<div className="promote-post-i2__setup-icon"></div>
				<h3 className="setup-pages__title wp-brand-font">
					{ translate( 'Your store is not eligible to Advertise with Blaze' ) }
				</h3>
				<p className="setup-pages__body">
					{ translate(
						"Unfortunately, your store doesn't qualify for advertising using Blaze. If you have any questions or need assistance, please contact our {{a}}support team{{/a}}.",
						{
							components: {
								a: (
									<a
										href={ localizeUrl( 'https://wordpress.com/help/contact' ) }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</div>
		</>
	);
}
