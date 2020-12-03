/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SocialLogo from 'calypso/components/social-logo';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Style dependencies
 */
import './style.scss';

const AnAutomatticAirline = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		x="0"
		y="0"
		viewBox="0 0 928 38"
		space="preserve"
	>
		<path d="M317.1 38.2c-12.6 0-20.7-9.1-20.7-18.5v-1.2c0-9.6 8.2-18.5 20.7-18.5 12.6 0 20.8 8.9 20.8 18.5v1.2C337.9 29.1 329.7 38.2 317.1 38.2zM331.2 18.6c0-6.9-5-13-14.1-13s-14 6.1-14 13v0.9c0 6.9 5 13.1 14 13.1s14.1-6.2 14.1-13.1V18.6zM175 36.8l-4.7-8.8h-20.9l-4.5 8.8h-7L157 1.3h5.5l19.5 35.5H175zM159.7 8.2l-7.7 14.9h15.7L159.7 8.2zM212.4 38.2c-12.7 0-18.7-6.9-18.7-16.2V1.3h6.6v20.9c0 6.6 4.3 10.5 12.5 10.5 8.4 0 11.9-3.9 11.9-10.5V1.3h6.7V22C231.4 30.8 225.8 38.2 212.4 38.2zM268.6 6.8v30h-6.7v-30h-15.5V1.3h37.7v5.5H268.6zM397.3 36.8V8.7l-1.8 3.1 -14.9 25h-3.3l-14.7-25 -1.8-3.1v28.1h-6.5V1.3h9.2l14 24.4 1.7 3 1.7-3 13.9-24.4h9.1v35.5H397.3zM454.4 36.8l-4.7-8.8h-20.9l-4.5 8.8h-7l19.2-35.5h5.5l19.5 35.5H454.4zM439.1 8.2l-7.7 14.9h15.7L439.1 8.2zM488.4 6.8v30h-6.7v-30h-15.5V1.3h37.7v5.5H488.4zM537.3 6.8v30h-6.7v-30h-15.5V1.3h37.7v5.5H537.3zM569.3 36.8V4.6c2.7 0 3.7-1.4 3.7-3.4h2.8v35.5H569.3zM628 11.3c-3.2-2.9-7.9-5.7-14.2-5.7 -9.5 0-14.8 6.5-14.8 13.3v0.7c0 6.7 5.4 13 15.3 13 5.9 0 10.8-2.8 13.9-5.7l4 4.2c-3.9 3.8-10.5 7.1-18.3 7.1 -13.4 0-21.6-8.7-21.6-18.3v-1.2c0-9.6 8.9-18.7 21.9-18.7 7.5 0 14.3 3.1 18 7.1L628 11.3zM321.5 12.4c1.2 0.8 1.5 2.4 0.8 3.6l-6.1 9.4c-0.8 1.2-2.4 1.6-3.6 0.8l0 0c-1.2-0.8-1.5-2.4-0.8-3.6l6.1-9.4C318.7 11.9 320.3 11.6 321.5 12.4L321.5 12.4z"></path>
		<path d="M37.5 36.7l-4.7-8.9H11.7l-4.6 8.9H0L19.4 0.8H25l19.7 35.9H37.5zM22 7.8l-7.8 15.1h15.9L22 7.8zM82.8 36.7l-23.3-24 -2.3-2.5v26.6h-6.7V0.8H57l22.6 24 2.3 2.6V0.8h6.7v35.9H82.8z"></path>
		<g display="none">
			<path
				display="inline"
				d="M694.6 38c-6.4 0-11.3-2-15.4-5.3l3.3-4.6c3.2 2.5 7.1 4.3 11.7 4.3 5.6 0 8.2-2.6 8.2-6.9V1.1h6.7v24.8C708.9 32.8 703.6 38 694.6 38zM750.7 36.6l-4.7-8.8h-20.8l-4.5 8.8h-7l19.2-35.5h5.5l19.5 35.5H750.7zM735.4 8L727.7 23h15.7L735.4 8zM806.4 36.6V8.5l-1.8 3.1 -14.9 25h-3.2l-14.7-25 -1.8-3.1v28.1h-6.5V1.1h9.2l14 24.3 1.7 3 1.7-3L804 1.1h9.1v35.5H806.4z"
			></path>
		</g>
		<path d="M718.1 36.6l-4.7-8.7h-20.7l-4.5 8.7h-7l19-35.2h5.5l19.3 35.2H718.1zM702.9 8.3l-7.7 14.8h15.6L702.9 8.3zM730.9 36.6V1.4h6.6v35.2H730.9zM777.9 36.6c-1.8 0-2.6-2.5-2.8-5.7l-0.2-3.6c-0.2-3.5-1.6-5-8.2-5h-12.5v14.2h-6.6V1.4h19.2c10.6 0 15.3 4.2 15.3 9.7 0 3.9-2 7.5-8.8 8.8 6.9 0.5 8.4 3.6 8.4 7.8l0.1 2.9c0.1 2.4 0.5 4.2 2.2 5.9v0.2H777.9zM775.4 11.9c0-2.5-2.1-5-7.7-5h-13.5v10.6h14.1c4.9 0 7.1-2.3 7.1-5.1V11.9zM791.4 36.6V1.4h6.6v29.7h27.5v5.5H791.4zM832.4 36.6V1.4h6.6v35.2H832.4zM880.7 36.6l-22.9-23.6 -2.2-2.5v26.1H849V1.4h6.3l22.2 23.5 2.3 2.5V1.4h6.6v35.2H880.7zM896.5 36.6V1.4h32v5.5h-25.4v9h19.5v5.3h-19.5v9.8h25.4v5.5H896.5z"></path>
		<g display="none">
			<rect x="88.4" y="1.2" display="inline" fill="#DEDDDD" width="49.4" height="35.5"></rect>
			<rect x="632.4" y="1.2" display="inline" fill="#DEDDDD" width="49.4" height="35.5"></rect>
		</g>
	</svg>
);

const JetpackComFooter = () => {
	const translate = useTranslate();

	const getTrackLinkClick = ( link: string ) => () => {
		recordTracksEvent( 'calypso_jetpack_footer_link_click', { link } );
	};

	return (
		<>
			<StoreFooter />
			<hr className="jpcom-footer__separator" />
			<footer className="jpcom-footer">
				<div className="jpcom-footer__col jpcom-footer__col--logo">
					<JetpackLogo classNameName="jpcom-footer__logo" full size={ 41 } />
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Product' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/features/"
								onClick={ getTrackLinkClick( 'tour' ) }
							>
								{ translate( 'Tour' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/pricing/"
								onClick={ getTrackLinkClick( 'pricing' ) }
							>
								{ translate( 'Pricing' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/blog/"
								onClick={ getTrackLinkClick( 'news' ) }
							>
								{ translate( 'News' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/about/"
								onClick={ getTrackLinkClick( 'about' ) }
							>
								{ translate( 'About' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://apps.wordpress.com/get?utm_source=jetpack-com-footer&utm_medium=direct&utm_campaign=get-apps-promo"
								onClick={ getTrackLinkClick( 'mobile_app' ) }
							>
								{ translate( 'Mobile app' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="http://automattic.com/privacy/"
								onClick={ getTrackLinkClick( 'privacy_policy' ) }
							>
								{ translate( 'Privacy Policy' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="http://wordpress.com/tos/"
								onClick={ getTrackLinkClick( 'terms_of_service' ) }
							>
								{ translate( 'Terms of Service' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Support & Resources' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/support/"
								onClick={ getTrackLinkClick( 'knowledge_base' ) }
							>
								{ translate( 'Knowledge Base' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://wordpress.org/support/plugin/jetpack"
								onClick={ getTrackLinkClick( 'forums' ) }
							>
								{ translate( 'Forums' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/contact-support/"
								onClick={ getTrackLinkClick( 'contact_us' ) }
							>
								{ translate( 'Contact Us' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://automattic.com/press/"
								onClick={ getTrackLinkClick( 'press' ) }
							>
								{ translate( 'Press' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/features/design/themes/showcase"
								onClick={ getTrackLinkClick( 'theme_showcase' ) }
							>
								{ translate( 'Theme Showcase' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/features/security/library"
								onClick={ getTrackLinkClick( 'security_library' ) }
							>
								{ translate( 'Security Library' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/business-guide"
								onClick={ getTrackLinkClick( 'business_guide' ) }
							>
								{ translate( 'Business Guide' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/hosting"
								onClick={ getTrackLinkClick( 'hosting_guide' ) }
							>
								{ translate( 'Hosting Guide' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'Developers' ) }</h4>
					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://developer.jetpack.com/"
								onClick={ getTrackLinkClick( 'developers_site' ) }
							>
								{ translate( 'Developers Site' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/beta/"
								onClick={ getTrackLinkClick( 'beta_program' ) }
							>
								{ translate( 'Beta Program' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.com/contribute/"
								onClick={ getTrackLinkClick( 'contribute_to_jetpack' ) }
							>
								{ translate( 'Contribute to Jetpack' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpack.pro/"
								onClick={ getTrackLinkClick( 'developer_network' ) }
							>
								{ translate( 'Developer Network' ) }
							</ExternalLink>
						</li>
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://automattic.com/work-with-us/?utm_source=jetpackcom&utm_medium=link"
								onClick={ getTrackLinkClick( 'work_with_us' ) }
							>
								{ translate( 'Work With Us' ) }
							</ExternalLink>
						</li>
					</ul>
				</div>
				<div className="jpcom-footer__col">
					<h4 className="jpcom-footer__col-header">{ translate( 'More from Jetpack' ) }</h4>

					<ul className="jpcom-footer__links">
						<li className="jpcom-footer__link">
							<ExternalLink
								href="https://jetpackcrm.com/"
								onClick={ getTrackLinkClick( 'jetpack_crm' ) }
							>
								{ translate( 'Jetpack CRM' ) }
							</ExternalLink>
						</li>
					</ul>
					<div className="jpcom-footer__sub-col">
						<h4 className="jpcom-footer__col-header">{ translate( 'Partnership' ) }</h4>
						<ul className="jpcom-footer__links">
							<li className="jpcom-footer__link">
								<ExternalLink
									href="https://jetpack.com/for/affiliates/"
									onClick={ getTrackLinkClick( 'become_an_affiliate' ) }
								>
									{ translate( 'Become an Affiliate' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink
									href="https://jetpack.com/for/agencies/"
									onClick={ getTrackLinkClick( 'become_an_agency' ) }
								>
									{ translate( 'Become an Agency' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink
									href="https://jetpack.com/for/hosts/"
									onClick={ getTrackLinkClick( 'become_a_partner' ) }
								>
									{ translate( 'Become a Partner' ) }
								</ExternalLink>
							</li>
							<li className="jpcom-footer__link">
								<ExternalLink
									href="https://jetpack.com/hosting/#criteria"
									onClick={ getTrackLinkClick( 'listing_criteria' ) }
								>
									{ translate( 'Listing Criteria' ) }
								</ExternalLink>
							</li>
						</ul>
					</div>
				</div>
			</footer>
			<hr className="jpcom-footer__separator" />
			<div className="jpcom-footer__plugs">
				<div className="jpcom-footer__plugs-group">
					<div className="jpcom-footer__a8c-services-plug">
						<SocialLogo icon="wordpress" size={ 20 } />
						<ExternalLink
							href="https://wordpress.com/"
							title="Powering WordPress.com"
							onClick={ getTrackLinkClick( 'powering_wordpress_dot_com' ) }
						>
							{ translate( 'Powering WordPress.com' ) }
						</ExternalLink>
					</div>

					<div className="jpcom-footer__a8c-attr-plug">
						<ExternalLink
							href="http://automattic.com"
							title={ translate( 'Automattic – makers of WordPress.com and more!' ) }
							onClick={ getTrackLinkClick( 'an_automattic_airline' ) }
						>
							<AnAutomatticAirline />
						</ExternalLink>
					</div>
				</div>
				<div className="jpcom-footer__hiring-plug">
					<ExternalLink
						href="https://automattic.com/work-with-us/code-wrangler/?utm_source=jetpackcom&amp;utm_medium=link&amp;utm_campaign=cw-backend-a8c-anywhere"
						title={ translate( 'We are super nice :)' ) }
						onClick={ getTrackLinkClick( 'automattic_is_hiring' ) }
					>
						{ translate(
							'Automattic is hiring backend developers anywhere in the world. Join us!'
						) }
					</ExternalLink>
				</div>
			</div>
		</>
	);
};

export default JetpackComFooter;
