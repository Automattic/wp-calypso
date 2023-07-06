import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
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
	fill: rgb( 54, 54, 54 );
	margin: 24px 12px 24px 24px;
	@media ( min-width: 480px ) {
		margin: 24px;
	}
`;

const ItemStyled = styled( Item )`
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	padding: 0;
	justify-content: left;
	flex: 1;

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
		.gridicon + .masterbar__item-content {
			display: block;
			padding: 0 0 0 2px;
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
	backText: string;
	canGoBack: boolean;
	contact?: JSX.Element | null;
	showContact?: boolean;
} ) => (
	<MasterbarStyledBlock>
		<Global
			styles={ css`
				body.is-section-checkout-thank-you {
					--masterbar-height: 72px;
				}
			` }
		/>
		<WordPressLogoStyled size={ 24 } />
		{ canGoBack && (
			<ItemStyled icon="chevron-left" onClick={ onClick }>
				{ backText }
			</ItemStyled>
		) }
		{ showContact && contact }
	</MasterbarStyledBlock>
);

export default MasterbarStyled;
