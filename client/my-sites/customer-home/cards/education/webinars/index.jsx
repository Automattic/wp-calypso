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
import temporaryIllustration from 'assets/images/customer-home/illustration--task-connect-social-accounts.svg';

/**
 * Style dependencies
 */
import './style.scss';

export const Webinars = () => {
	const translate = useTranslate();

	return (
		<Card className="webinars">
			<CardHeading>{ translate( 'Get hands-on learning from our experts' ) }</CardHeading>
			<div className="webinars__content">
				<div className="webinars__text">
					<p>
						{ translate(
							'Register for a live video webinar to help you get started or learn advanced features.'
						) }
					</p>
					<ExternalLink href="https://wordpress.com/webinars/" icon>
						{ translate( 'Register for free' ) }
					</ExternalLink>
				</div>
				{ isDesktop() && (
					<img src={ temporaryIllustration } className="webinars__illustration" alt="" />
				) }
			</div>
		</Card>
	);
};

export default Webinars;
