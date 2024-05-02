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
						data-name="Layer 2"
						xmlns="http://www.w3.org/2000/svg"
						width="133"
						height="70"
						viewBox="0 0 133 70"
					>
						<defs>
							<linearGradient
								id="linear-gradient"
								x1="34.3"
								y1="-571.2"
								x2="34.3"
								y2="-611.2"
								gradientTransform="translate(0 -556) scale(1 -1)"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stopColor="#e94338" />
								<stop offset="1" stopColor="#ffb800" />
							</linearGradient>
						</defs>
						<path
							d="M80.8,11h26c13.3,0,24,10.7,24,24h0c0,13.3-10.7,24-24,24h-26c-13.3,0-24-10.7-24-24h0c0-13.3,10.7-24,24-24Z"
							fill="none"
							stroke="#000"
							strokeOpacity=".2"
							strokeWidth="4"
						/>
						<circle cx="34.8" cy="35.2" r="31" fill="#fff" stroke="#f6f7f7" strokeWidth="8" />
						<path
							d="M53.3,38c0,2.3-.5,4.6-1.4,6.7-1,2.1-2.4,4.1-4.1,5.7-1.8,1.6-3.9,2.9-6.2,3.8-1.1.4-2.2.7-3.4,1l.5-.3s4.4-2.5,5.3-8.2c.4-5.1-3.8-7.3-3.8-7.3,0,0-2.1,2.7-5.2,2.7-4.8,0-3.9-8-3.9-8,0,0-7.3,3.7-7.3,11.9s5.1,8.8,5.1,8.8h0c-.7-.2-1.3-.4-2-.6-2.3-.9-4.4-2.2-6.2-3.8-1.8-1.6-3.2-3.6-4.1-5.7-1-2.1-1.4-4.4-1.4-6.7,0-7.8,9.1-15.4,9.1-15.4,0,0,.9,5.9,5.3,5.9,8.4,0,5.3-13.4,5.3-13.4,7.7,4.7,9.5,10.4,9.1,16.3,4.1-.5,4.6-5.9,4.6-5.9,0,0,4.6,5.9,4.6,12.5"
							fill="url(#linear-gradient)"
							strokeWidth="0"
						/>
						<path
							d="M105.7,18.8h0c8.8,0,16,7.2,16,16h0c0,8.8-7.2,16-16,16h0c-8.8,0-16-7.2-16-16h0c0-8.8,7.2-16,16-16Z"
							fill="#2fb41f"
							strokeWidth="0"
						/>
					</svg>
				</div>
				<h3 className="setup-pages__title wp-brand-font">
					{ translate( 'Set up Blaze and start advertising' ) }
				</h3>
				<p className="empty-promotion-list__body">
					{ translate(
						'To get started, go to the Jetpack settings page and follow the steps below.'
					) }
				</p>

				<ul className="promote-post-i2__active-steps">
					<li>
						<span>1</span>
						<div>
							{ translate( 'Open {{a}}settings{{/a}} page and find “Traffic” section', {
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
						<div>{ translate( 'Locate Blaze option and toggle it to active' ) }</div>
					</li>
					<li>
						<span>3</span>
						<div>{ translate( 'Come back to this page and refresh it' ) }</div>
					</li>
				</ul>
			</div>
		</>
	);
}
