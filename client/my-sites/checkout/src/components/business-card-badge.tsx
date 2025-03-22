import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import CoreBadge from 'calypso/components/core/badge';
import InlineSupportLink from 'calypso/components/inline-support-link';

const StyledBadge = styled( CoreBadge )`
	background-color: var( --studio-blue-10 );
	a,
	a:visited {
		color: var( --studio-blue-60 );
	}
`;

const BusinessCardBadge = () => {
	const translate = useTranslate();
	return (
		<StyledBadge>
			{
				translate( '{{link}}Business{{/link}}', {
					components: {
						link: (
							<InlineSupportLink supportContext="setting-up-a-business-card" showIcon={ false } />
						),
					},
				} ) as string
			}
		</StyledBadge>
	);
};

export default BusinessCardBadge;
