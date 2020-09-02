/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import StoreFooter from 'jetpack-connect/store-footer';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackComFooter = () => {
	const translate = useTranslate();
	return (
		<>
			<StoreFooter />
			<footer className="jpcom-footer">
				<div className="jpcom-footer__col jpcom-footer__col--logo">
					<JetpackLogo classNameName="jpcom-footer__logo" full size={ 32 } />
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">Product</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Tour' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Pricing' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'News' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'About' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Mobile app' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Privacy Policy' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Terms of Service' ) }</a>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">Support & Resources</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Knowledge Base' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Forums' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Contact Us' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Press' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Theme Showcase' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Security Library' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Business Guide' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Hosting Guide' ) }</a>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">Developers</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Developers Site' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Beta Program' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Contribute to Jetpack' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Developer Network' ) }</a>
						</li>
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Work With Us' ) }</a>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">More from Jetpack</h4>

					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<a href="/">{ translate( 'Jetpack CRM' ) }</a>
						</li>
					</ul>
					<div className="jpcom-footer__sub-col">
						<h4 className="jpcom-footer__col-header">Partnership</h4>
						<ul className="jpcom-footer__links">
							<li className="jpcom-footer__link">
								<a href="/">{ translate( 'Become an Affiliate' ) }</a>
							</li>
							<li className="jpcom-footer__link">
								<a href="/">{ translate( 'Become an Agency' ) }</a>
							</li>
							<li className="jpcom-footer__link">
								<a href="/">{ translate( 'Become a Partner' ) }</a>
							</li>
							<li className="jpcom-footer__link">
								<a href="/">{ translate( 'Listing Criteria' ) }</a>
							</li>
						</ul>
					</div>
				</div>
			</footer>
		</>
	);
};

export default JetpackComFooter;
