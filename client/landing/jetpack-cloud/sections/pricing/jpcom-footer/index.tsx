/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
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
					<JetpackLogo classNameName="jpcom-footer__logo" full size={ 41 } />
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Product' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/features/">
								{ translate( 'Tour' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/pricing/">
								{ translate( 'Pricing' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/blog/">{ translate( 'News' ) }</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/about/">
								{ translate( 'About' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://apps.wordpress.com/get?utm_source=jetpack-com-footer&utm_medium=direct&utm_campaign=get-apps-promo">
								{ translate( 'Mobile app' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="http://automattic.com/privacy/">
								{ translate( 'Privacy Policy' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="http://wordpress.com/tos/">
								{ translate( 'Terms of Service' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Support & Resources' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/support/">
								{ translate( 'Knowledge Base' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://wordpress.org/support/plugin/jetpack">
								{ translate( 'Forums' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/contact-support/">
								{ translate( 'Contact Us' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://automattic.com/press/">
								{ translate( 'Press' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/features/design/themes/showcase">
								{ translate( 'Theme Showcase' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/features/security/library">
								{ translate( 'Security Library' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/business-guide">
								{ translate( 'Business Guide' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/hosting">
								{ translate( 'Hosting Guide' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Developers' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink href="https://developer.jetpack.com/">
								{ translate( 'Developers Site' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/beta/">
								{ translate( 'Beta Program' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.com/contribute/">
								{ translate( 'Contribute to Jetpack' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpack.pro/">
								{ translate( 'Developer Network' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink href="https://automattic.com/work-with-us/?utm_source=jetpackcom&utm_medium=link">
								{ translate( 'Work With Us' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'More from Jetpack' ) }</h4>

					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink href="https://jetpackcrm.com/">
								{ translate( 'Jetpack CRM' ) }
							</ExternalLink>
						</li>
					</ul>
					<div className="jpcom-footer__sub-col">
						<h4 className="jpcom-footer__col-header">{ translate( 'Partnership' ) }</h4>
						<ul className="jpcom-footer__links">
							<li className="jpcom-footer__link">
								<ExternalLink href="https://jetpack.com/for/affiliates/">
									{ translate( 'Become an Affiliate' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink href="https://jetpack.com/for/agencies/">
									{ translate( 'Become an Agency' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink href="https://jetpack.com/for/hosts/">
									{ translate( 'Become a Partner' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink href="https://jetpack.com/hosting/#criteria">
									{ translate( 'Listing Criteria' ) }
								</ExternalLink>
							</li>
						</ul>
					</div>
				</div>
			</footer>
		</>
	);
};

export default JetpackComFooter;
