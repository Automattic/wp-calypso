import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import DotcomWooSquareImage from 'calypso/assets/images/start-with/dotcom-woo-square.png';

import 'calypso/start-with/style.scss';
import 'calypso/start-with/square-payments/style.scss';

export const StartWithSquarePayments: React.FC = () => {
	const translate = useTranslate();

	return (
		<>
			<div className="start-with-square-payments">
				<div className="left-column">
					<h1>{ translate( 'Get Started with WordPress.com and Square Payments' ) }</h1>
					<p>
						{ translate(
							'Partnering with Square Payments, WordPress.com offers you an easy way to build and manage your online store. Click below to begin your quick and easy setup process.'
						) }
					</p>
					<Button className="start-store-cta">{ translate( 'Start your store now' ) }</Button>
				</div>
				<div className="right-column">
					<img src={ DotcomWooSquareImage } width={ 500 } alt="" />
				</div>
			</div>
		</>
	);
};
