import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import supportImage from 'calypso/assets/images/illustrations/dotcom-support.svg';
import Main from 'calypso/components/main';

import './style.scss';

export default function DIFMLiteThankYou(): JSX.Element {
	const translate = useTranslate();

	return (
		<Main className="difm-lite-thank-you">
			<Card>
				<div className="difm-lite-thank-you__header">
					<div className="difm-lite-thank-you__header-icon">
						<img src="/calypso/images/upgrades/thank-you.svg" alt="" />
					</div>
					<div className="difm-lite-thank-you__header-content">
						<div className="difm-lite-thank-you__header-copy">
							<h1 className="difm-lite-thank-you__header-heading">
								{ translate( 'Thank you for your purchase!' ) }
							</h1>

							<h2 className="difm-lite-thank-you__header-text">
								{ translate(
									'Our Built By WordPress.com team will be in touch with you within 1-2 days when your site is ready to be transferred to your account and launched.'
								) }
							</h2>
						</div>
					</div>
				</div>
			</Card>
			<Card className="difm-lite-thank-you__footer">
				<div className="difm-lite-thank-you">
					<div className="difm-lite-thank-you__image">
						<div className="difm-lite-thank-you__icon">
							<img alt="" src={ supportImage } />
						</div>
					</div>

					<div className="difm-lite-thank-you__text">
						<h3 className="difm-lite-thank-you__heading">{ translate( 'Questions?' ) }</h3>
						<p className="difm-lite-thank-you__description">
							{ translate( 'Email us at ' ) }
							<a href="mailto:builtby@wordpress.com">builtby@wordpress.com</a>
						</p>
					</div>
				</div>
			</Card>
		</Main>
	);
}
