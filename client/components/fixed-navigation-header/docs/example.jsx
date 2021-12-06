import styled from '@emotion/styled';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

const FixedNavigationHeaderStyled = styled( FixedNavigationHeader )`
	position: relative;
	top: inherit;
	left: inherit;
	width: 100%;
`;

const FixedNavigationHeaderExample = () => {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
	];
	return (
		<FixedNavigationHeaderStyled navigationItems={ navigationItems }>
			Some Children Elements
		</FixedNavigationHeaderStyled>
	);
};

FixedNavigationHeaderExample.displayName = 'FixedNavigationHeader';

export default FixedNavigationHeaderExample;
