import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

const StyledBadge = styled.span`
	background-color: var( --studio-blue-10 );
	margin-bottom: 0.1em;
	padding: 0.1em 0.8em;
	border-radius: 5px;
	display: inline-block;
	font-size: small;

	a,
	a:visited {
		color: var( --studio-blue-60 );
		font-weight: 500;
	}
`;

const BusinessCardBadge = () => {
	const translate = useTranslate();
	return (
		<>
			<StyledBadge>
				{
					translate( '{{link}}Business{{/link}}', {
						components: {
							link: (
								<InlineSupportLink
									id="setting-up-a-business-card"
									supportContext="tax-exempt-customers"
									showIcon={ false }
								/>
							),
						},
					} ) as string
				}
			</StyledBadge>
		</>
	);
};

export default BusinessCardBadge;
