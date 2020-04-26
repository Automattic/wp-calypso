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

export const WebinarPromotion = () => {
	const translate = useTranslate();

	return (
		<Card className="webinar-promotion">
			<CardHeading>{ translate( 'Get hands-on learning from our experts' ) }</CardHeading>
			<div className="webinar-promotion__content">
				<div className="webinar-promotion__text">
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
					<img src={ temporaryIllustration } className="webinar-promotion__illustration" alt="" />
				) }
			</div>
		</Card>
	);
};

export default WebinarPromotion;
