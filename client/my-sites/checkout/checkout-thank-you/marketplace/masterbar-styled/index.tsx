import styled from '@emotion/styled';
import { ReactChild } from 'react';
import WordPressLogo from 'calypso/components/wordpress-logo';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { DefaultMasterbarContact } from './default-contact';

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

const ItemStyled = styled( Item )`
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	padding: 0;
	justify-content: left;

	&:hover {
		background: var( --studio-white );
		text-decoration: underline;
	}

	.gridicon {
		height: 17px;
		fill: var( --studio-black );

		@media ( max-width: 480px ) {
			margin: 0;
		}
	}

	@media ( max-width: 480px ) {
		.masterbar__item-content {
			display: block;
		}
	}
`;

const MasterbarStyled = ( {
	onClick,
	backText,
	canGoBack = true,
	contact = <DefaultMasterbarContact />,
	showContact = true,
}: {
	onClick: () => void;
	backText: ReactChild;
	canGoBack: boolean;
	contact?: JSX.Element | null;
	showContact?: boolean;
} ) => (
	<MasterbarStyledBlock>
		<WordPressLogoStyled />
		{ canGoBack && (
			<ItemStyled icon="chevron-left" onClick={ onClick }>
				{ backText }
			</ItemStyled>
		) }
		{ showContact && contact }
	</MasterbarStyledBlock>
);

export default MasterbarStyled;
