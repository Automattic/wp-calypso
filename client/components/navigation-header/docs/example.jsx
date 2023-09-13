import styled from '@emotion/styled';
import NavigationHeader from 'calypso/components/fixed-navigation-header';

const NavigationHeaderStyled = styled( NavigationHeader )`
	position: relative;
	top: inherit;
	left: inherit;
	width: 100%;
`;

const NavigationHeaderExample = () => {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
	];
	return (
		<NavigationHeaderStyled navigationItems={ navigationItems }>
			Some Children Elements
		</NavigationHeaderStyled>
	);
};

NavigationHeaderExample.displayName = 'NavigationHeader';

export default NavigationHeaderExample;
