import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import privateSiteGraphic from 'calypso/assets/images/blaze/site-private-graphic@3x.png';

export default function DisconnectedSite() {
	const translate = useTranslate();
	const connectUrl = config( 'connect_url' );

	return (
		<>
			<div className="promote-post-i2__inner-container">
				<div className="promote-post-i2__setup-icon">
					<img src={ privateSiteGraphic } alt="" />
				</div>
				<h3 className="setup-pages__title wp-brand-font width-fix">
					{ translate( 'Welcome to Blaze Ads' ) }
				</h3>
				<p className="setup-pages__body">
					{ translate( 'One-click advertising for your store and products.' ) }
				</p>

				<ul className="promote-post-i2__active-steps">
					<li>
						<div className="promote-post-i2__step-icon-container">
							<svg
								width="32"
								height="33"
								viewBox="0 0 32 33"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="16" cy="16.3325" r="16" fill="#B99AD3" />
								<path
									d="M16.414 20.3325L18.414 18.3325L17 16.9185L15 18.9185L13.414 17.3325L15.414 15.3325L14 13.9185L12 15.9185L10.671 14.5905C10.4835 14.403 10.2292 14.2977 9.96399 14.2977C9.69883 14.2977 9.44452 14.403 9.25699 14.5905L7.75699 16.0905C6.75394 17.0922 6.13875 18.4172 6.02082 19.8299C5.9029 21.2426 6.2899 22.6513 7.11299 23.8055L4.29299 26.6255C4.19748 26.7177 4.1213 26.828 4.06889 26.9501C4.01648 27.0721 3.98889 27.2033 3.98774 27.3361C3.98659 27.4688 4.01189 27.6005 4.06217 27.7234C4.11245 27.8463 4.1867 27.958 4.28059 28.0519C4.37449 28.1457 4.48614 28.22 4.60904 28.2703C4.73193 28.3206 4.86361 28.3459 4.99639 28.3447C5.12917 28.3436 5.26039 28.316 5.38239 28.2636C5.5044 28.2111 5.61474 28.135 5.70699 28.0395L8.52699 25.2195C9.68135 26.0427 11.0903 26.4297 12.5032 26.3116C13.9161 26.1935 15.2413 25.5779 16.243 24.5745L17.743 23.0745C17.9305 22.8869 18.0358 22.6326 18.0358 22.3675C18.0358 22.1023 17.9305 21.848 17.743 21.6605L16.414 20.3325Z"
									fill="#F7F7F7"
								/>
								<path
									d="M21.329 18.0744C21.5165 18.2618 21.7708 18.3671 22.036 18.3671C22.3012 18.3671 22.5555 18.2618 22.743 18.0744L24.243 16.5744C25.246 15.5726 25.8612 14.2476 25.9792 12.8349C26.0971 11.4222 25.7101 10.0135 24.887 8.85936L27.707 6.03936C27.8025 5.94711 27.8787 5.83677 27.9311 5.71476C27.9835 5.59276 28.0111 5.46154 28.0122 5.32876C28.0134 5.19598 27.9881 5.0643 27.9378 4.9414C27.8875 4.81851 27.8133 4.70685 27.7194 4.61296C27.6255 4.51907 27.5138 4.44482 27.3909 4.39453C27.268 4.34425 27.1364 4.31895 27.0036 4.32011C26.8708 4.32126 26.7396 4.34885 26.6176 4.40126C26.4956 4.45366 26.3852 4.52985 26.293 4.62536L23.473 7.44536C22.3186 6.62213 20.9096 6.23514 19.4967 6.35325C18.0838 6.47136 16.7587 7.0869 15.757 8.09036L14.257 9.59036C14.0695 9.77788 13.9642 10.0322 13.9642 10.2974C13.9642 10.5625 14.0695 10.8168 14.257 11.0044L21.329 18.0744Z"
									fill="#F7F7F7"
								/>
							</svg>
						</div>
						<div>
							<h4>{ translate( 'Connect your store' ) }</h4>
							<p>
								{ translate(
									"You'll need to connect your WordPress.com account to integrate Blaze Ads with your store. Don’t have an account? Not to worry - we’ll help you create one!"
								) }
							</p>
							<Button className="is-primary" href={ connectUrl } target="_self">
								{ translate( 'Connect now' ) }
							</Button>
						</div>
					</li>
				</ul>
			</div>
		</>
	);
}
