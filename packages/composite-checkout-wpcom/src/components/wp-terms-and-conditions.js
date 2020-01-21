/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import interpolateComponents from 'interpolate-components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useHasDomainsInCart } from '../hooks/has-domains';

export default function WPTermsAndConditions( { domainName } ) {
	const isDomainsTermsVisible = useHasDomainsInCart();
	const translate = useTranslate();

	return (
		<TermsAndConditionsWrapper>
			<TermsParagraph>
				{ interpolateComponents( {
					mixedString: translate(
						'{{strong}}By checking out:{{/strong}} you agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{howSubscriptionWorks}}how your subscription works{{/howSubscriptionWorks}} and {{howToCancel}}how to cancel{{/howToCancel}}.'
					),
					components: {
						strong: <strong />,
						tosLink: (
							<a href="https://wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />
						),
						howSubscriptionWorks: (
							<a
								href="https://en.support.wordpress.com/manage-purchases/#automatic-renewal"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						howToCancel: (
							<a
								href="https://en.support.wordpress.com/manage-purchases/#FAQ-Cancelling"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				} ) }
			</TermsParagraph>
			{ isDomainsTermsVisible && (
				<React.Fragment>
					<TermsParagraph>
						{ interpolateComponents( {
							mixedString: translate(
								'You agree to the {{domainRegistrationAgreement}}Domain Registration Agreement{{/domainRegistrationAgreement}} for %(domainName)s.',
								{
									args: {
										domainName,
									},
								}
							),
							components: {
								domainRegistrationAgreement: (
									<a
										href="https://wordpress.com/automattic-domain-name-registration-agreement/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</TermsParagraph>
					<TermsParagraph>
						{ interpolateComponents( {
							mixedString: translate(
								'You understand that {{domainRefunds}}domain name refunds{{/domainRefunds}} are limited to 96 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.'
							),
							components: {
								domainRefunds: (
									<a
										href="https://en.support.wordpress.com/manage-purchases/#refund-policy"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</TermsParagraph>
				</React.Fragment>
			) }
		</TermsAndConditionsWrapper>
	);
}

const TermsAndConditionsWrapper = styled.div`
	padding: 24px 0 0;
	margin: 24px 30px 8px 0;
	border-top: 1px solid ${props => props.theme.colors.borderColorLight};
`;

const TermsParagraph = styled.p`
	margin: 16px 0 0;
	font-size: 14px;
	color: ${props => props.theme.colors.textColor};

	a {
		color: ${props => props.theme.colors.textColor};
	}

	a:hover {
		text-decoration: none;
	}

	a:active {
		text-decoration: underline;
	}

	:first-of-type {
		margin-top: 0;
	}
`;
