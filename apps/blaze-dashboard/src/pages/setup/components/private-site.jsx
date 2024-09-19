import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function PrivateSite() {
	const selectedSiteData = useSelector( getSelectedSite );
	const siteSlug = selectedSiteData?.slug;

	const translate = useTranslate();

	return (
		<>
			<div className="promote-post-i2__inner-container">
				<div className="promote-post-i2__setup-icon">
					<svg
						width="148"
						height="148"
						viewBox="0 0 148 148"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clipPath="url(#clip0_1610_281)">
							<rect x="63.5" y="117" width="73" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="102.5" y="117" width="34" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="63.5" y="129" width="57" height="7" rx="3.5" fill="#E8E0F2" />
							<circle cx="32.5" cy="126" r="22" fill="#E8E0F2" />
							<rect x="63.5" y="13" width="75" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="63.5" y="25" width="27" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="95.5" y="25" width="33" height="7" rx="3.5" fill="#E8E0F2" />
							<circle cx="32.5" cy="22" r="22" fill="#E8E0F2" />
							<rect x="62.5" y="52" width="76" height="44" rx="22" fill="#2145E6" />
							<circle cx="32.5" cy="74" r="22" fill="white" />
							<path
								d="M48.5919 72.6789C46.4634 69.6156 40.6349 62.5 32.5 62.5C24.2941 62.5 18.5065 69.6235 16.401 72.689C16.1386 73.076 15.9989 73.5332 16 74.001C16.0012 74.4688 16.1432 74.9253 16.4074 75.311C18.533 78.375 24.3551 85.5 32.5 85.5C40.5704 85.5 46.4362 78.3844 48.5847 75.3196C48.8538 74.9324 48.9987 74.4722 49 74.0004C49.0013 73.5286 48.8589 73.0676 48.5919 72.6789ZM32.5 80.4688C31.2226 80.4688 29.9739 80.0894 28.9118 79.3786C27.8497 78.6678 27.0219 77.6575 26.5331 76.4755C26.0443 75.2935 25.9164 73.9928 26.1656 72.738C26.4148 71.4832 27.0299 70.3306 27.9331 69.4259C28.8364 68.5212 29.9872 67.9051 31.24 67.6555C32.4929 67.4059 33.7915 67.534 34.9716 68.0237C36.1518 68.5133 37.1604 69.3424 37.8701 70.4062C38.5798 71.4699 38.9586 72.7206 38.9586 74C38.9586 75.7156 38.2781 77.361 37.0669 78.5741C35.8557 79.7872 34.2129 80.4688 32.5 80.4688Z"
								fill="#814BB0"
							/>
							<rect x="84" y="71" width="33" height="7" rx="3.5" fill="#F6F7F7" />
						</g>
						<defs>
							<clipPath id="clip0_1610_281">
								<rect width="148" height="148" fill="white" />
							</clipPath>
						</defs>
					</svg>
				</div>
				<h3 className="setup-pages__title wp-brand-font">
					{ translate( 'Make sure your site is public' ) }
				</h3>
				<p className="setup-pages__body">
					{ translate( 'Go to your WordPress.com dashboard and follow the steps below.' ) }
				</p>
				<ul className="promote-post-i2__active-steps">
					<li>
						<span>1</span>
						<div>
							{ translate( "Navigate to your site's {{a}}Privacy settings{{/a}}.", {
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
						<div>{ translate( 'Set your site as Public.' ) }</div>
					</li>
					<li>
						<span>3</span>
						<div>{ translate( 'Refresh this page.' ) }</div>
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
