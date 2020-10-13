/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { hasPlan } from 'calypso/lib/cart-values/cart-items';

export class SignupSiteCreatedNotice extends PureComponent {
	getUpgradeText() {
		const { cart, translate } = this.props;
		const hasPlanInCart = hasPlan( cart );
		const bundledDomain = cart && cart.bundled_domain;
		let hintText = translate( 'Complete your purchase to access your upgrade benefits.' );

		if ( hasPlanInCart ) {
			hintText = translate( 'Complete your plan purchase to upgrade.' );
		}

		if ( hasPlanInCart && bundledDomain ) {
			hintText = translate(
				"Once you've upgraded, your new site address will be {{strong}}%(bundledDomain)s{{/strong}}",
				{
					components: { strong: <strong /> },
					args: { bundledDomain },
					comment: '`bundledDomain` is the domain name at checkout',
				}
			);
		}

		return hintText;
	}

	render() {
		const { selectedSite, translate } = this.props;

		return (
			<div className="checkout__site-created-notice-wrapper">
				<img
					src="/calypso/images/signup/confetti.svg"
					aria-hidden="true"
					className="checkout__site-created-image"
					alt=""
				/>
				<div className="checkout__site-created-copy">
					<div>
						{ translate( '{{em}}%(siteSlug)s{{/em}} is up and running!', {
							components: { em: <em /> },
							args: { siteSlug: selectedSite.slug },
							comment: '`siteSlug` is the WordPress.com site, e.g., testsite.wordpress.com',
						} ) }
					</div>
					<div>{ this.getUpgradeText() }</div>
				</div>
			</div>
		);
	}
}

export default localize( SignupSiteCreatedNotice );
