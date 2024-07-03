import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function BlazeDisabled() {
	const selectedSiteData = useSelector( getSelectedSite );
	const adminUrl = selectedSiteData?.options?.admin_url;

	const translate = useTranslate();

	return (
		<>
			<div className="promote-post-i2__inner-container">
				<div className="promote-post-i2__setup-icon">
					<svg
						width="149"
						height="148"
						viewBox="0 0 149 148"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clipPath="url(#clip0_1610_126)">
							<rect x="64" y="117" width="73" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="103" y="117" width="34" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="64" y="129" width="57" height="7" rx="3.5" fill="#E8E0F2" />
							<circle cx="33" cy="126" r="22" fill="#E8E0F2" />
							<rect x="64" y="13" width="75" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="64" y="25" width="27" height="7" rx="3.5" fill="#E8E0F2" />
							<rect x="96" y="25" width="33" height="7" rx="3.5" fill="#E8E0F2" />
							<circle cx="33" cy="22" r="22" fill="#E8E0F2" />
							<rect
								x="66.7821"
								y="55.7821"
								width="68.4359"
								height="36.4359"
								rx="18.2179"
								fill="white"
								stroke="#FEFEFE"
								strokeWidth="7.5641"
							/>
							<rect x="103" y="61" width="27" height="26" rx="13" fill="#2FB41F" />
							<circle cx="33" cy="74" r="22" fill="white" />
							<path
								d="M48.4815 76.2964C48.4815 78.178 48.082 80.0327 47.301 81.7716C46.5201 83.5104 45.3852 85.0887 43.9415 86.4174C42.5068 87.7461 40.7997 88.7983 38.9202 89.5207C38.0304 89.8595 37.1133 90.1181 36.178 90.2964L36.5957 90.0735C36.5957 90.0735 40.2095 88.0048 40.9269 83.3677C41.2628 79.2301 37.8306 77.4199 37.8306 77.4199C37.8306 77.4199 36.0872 79.6299 33.6083 79.6299C29.7131 79.6299 30.4198 73.1425 30.4198 73.1425C30.4198 73.1425 24.5102 76.1893 24.5102 82.8238C24.5102 86.9703 28.687 90.029 28.687 90.029V90.0379C28.1421 89.8951 27.6065 89.7169 27.0798 89.5118C25.2003 88.7894 23.4932 87.7372 22.0586 86.4085C20.6239 85.0798 19.4798 83.5015 18.699 81.7626C17.9181 80.0238 17.5186 78.1689 17.5186 76.2875C17.5186 69.9206 24.946 63.7497 24.946 63.7497C24.946 63.7497 25.6542 68.5919 29.2772 68.5919C36.0872 68.5919 33.6083 57.7039 33.6083 57.7039C39.8661 61.5021 41.3799 66.1663 41.0195 70.9977C44.3983 70.5587 44.7587 66.1663 44.7587 66.1663C44.7587 66.1663 48.4815 71.0085 48.4815 76.3409"
								fill="url(#paint0_linear_1610_126)"
							/>
						</g>
						<defs>
							<linearGradient
								id="paint0_linear_1610_126"
								x1="33"
								y1="57.7039"
								x2="33"
								y2="90.2964"
								gradientUnits="userSpaceOnUse"
							>
								<stop stopColor="#E94338" />
								<stop offset="1" stopColor="#FFB800" />
							</linearGradient>
							<clipPath id="clip0_1610_126">
								<rect width="148" height="148" fill="white" transform="translate(0.5)" />
							</clipPath>
						</defs>
					</svg>
				</div>
				<h3 className="setup-pages__title wp-brand-font">
					{ translate( 'Set up Blaze and start advertising' ) }
				</h3>
				<p className="setup-pages__body">
					{ translate(
						'To get started, go to the Jetpack settings page and follow the steps below.'
					) }
				</p>

				<ul className="promote-post-i2__active-steps">
					<li>
						<span>1</span>
						<div>
							{ translate( "Navigate to your site's {{a}}Traffic settings{{/a}}.", {
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
						</div>
					</li>
					<li>
						<span>2</span>
						<div>{ translate( 'Set Blaze as active.' ) }</div>
					</li>
					<li>
						<span>3</span>
						<div>{ translate( 'Refresh this page.' ) }</div>
					</li>
				</ul>
			</div>
		</>
	);
}
