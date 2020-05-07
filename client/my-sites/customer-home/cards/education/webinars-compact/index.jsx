/**
 * External dependencies
 */
import React from 'react';
import { Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import ExternalLink from 'components/external-link';
import webinarIllustration from 'assets/images/customer-home/illustration-webinars.svg';

/**
 * Style dependencies
 */
import './style.scss';

export const Webinars = () => {
	const translate = useTranslate();

	return (
		<Card className="webinars-compact">
			<div className="webinars-compact__content">
				<div>
					<CardHeading>{ translate( 'Learn from the pros' ) }</CardHeading>
					<p>
						{ translate(
							'Free webinars with Happiness Engineers teach you to build a website, start a blog, or make money on your site.'
						) }
					</p>
					<ExternalLink href="https://wordpress.com/webinars/" icon>
						{ translate( 'Register for free' ) }
					</ExternalLink>
				</div>
				{ isDesktop() && (
					<img src={ webinarIllustration } className="webinars-compact__illustration" alt="" />
				) }
			</div>
		</Card>
	);
};

export default Webinars;
