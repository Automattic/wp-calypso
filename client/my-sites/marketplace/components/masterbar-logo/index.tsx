import { WordPressLogo } from '@automattic/components';
import styled from '@emotion/styled';
import Masterbar from 'calypso/layout/masterbar/masterbar';

const MasterbarStyledBlock = styled( Masterbar )`
	--color-masterbar-background: var( --studio-white );
	--color-masterbar-text: var( --studio-gray-60 );
	border-bottom: 0;
`;

const WordPressLogoStyled = styled( WordPressLogo )`
	max-height: calc( 100% - 47px );
	align-self: center;
	fill: rgb( 54, 54, 54 );
`;

const MasterbarLogo = () => (
	<MasterbarStyledBlock>
		<WordPressLogoStyled />
	</MasterbarStyledBlock>
);

export default MasterbarLogo;
