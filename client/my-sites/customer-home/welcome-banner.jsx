/**
 * External dependencies
 */
import React from 'react';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';

export const WelcomeBanner = ( { translate } ) => {
	return (
		<div className="customer-home__welcome-banner">
			<Card>
				<img
					src="/calypso/images/extensions/woocommerce/woocommerce-setup.svg"
					aria-hidden="true"
					alt=""
				/>
				<div>
					<CardHeading>{ translate( 'Learn and grow with My Home' ) }</CardHeading>
					<p>
						{ translate(
							'This is your new home for quick links to common tasks, easy access to support, and guidance ' +
								'tailored to you. We’ll keep improving what you see here to help you learn and grow with us.'
						) }
					</p>
					<Button>{ translate( 'Got it!' ) }</Button>
				</div>
			</Card>
		</div>
	);
};

export default localize( WelcomeBanner );
