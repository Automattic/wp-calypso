/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { useHasDomainsInCart } from '../public-api';
import { useLocalize } from '../lib/localize';

export default function WPTermsAndConditions() {
	const isDomainsTermsVisible = useHasDomainsInCart();
	const localize = useLocalize();

	//TODO: replace domainname.com next to domainRegistrationAgreement with the domain being purchased.
	return (
		<TermsAndConditionsWrapper>
			<TermsParagraph>
				{ localize(
					'{strong}By checking out:{/strong} you agree to our {tosLink}Terms of Service{/tosLink} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {howSubscriptionWorks}how your subscription works{/howSubscriptionWorks} and {howToCancel}how to cancel{/howToCancel}. ',
					{
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
					}
				) }
			</TermsParagraph>
			{ isDomainsTermsVisible && (
				<React.Fragment>
					<TermsParagraph>
						{ localize(
							'You agree to the {domainRegistrationAgreement}Domain Registration Agreement{/domainRegistrationAgreement} for domainname.com.',
							{
								components: {
									domainRegistrationAgreement: (
										<a
											href="https://wordpress.com/automattic-domain-name-registration-agreement/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</TermsParagraph>
					<TermsParagraph>
						{ localize(
							'You understand that {domainRefunds}domain name refunds{/domainRefunds} are limited to 96 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
							{
								components: {
									domainRefunds: (
										<a
											href="https://en.support.wordpress.com/manage-purchases/#refund-policy"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</TermsParagraph>
				</React.Fragment>
			) }
		</TermsAndConditionsWrapper>
	);
}

const TermsAndConditionsWrapper = styled.div`
	padding: 24px 0 0;
	margin-top: 24px;
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

	:first-child {
		margin-top: 0;
	}
`;
