import { Global, css } from '@emotion/react';
import WordPressLogo from 'calypso/components/wordpress-logo';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { DefaultMasterbarContact } from './default-contact';
import './style.scss';

const MasterbarStyled = ( {
	onClick,
	backText,
	canGoBack = true,
	contact = <DefaultMasterbarContact />,
	showContact = true,
}: {
	onClick?: () => void;
	backText?: string;
	canGoBack: boolean;
	contact?: JSX.Element | null;
	showContact?: boolean;
} ) => (
	<Masterbar className="checkout-thank-you__masterbar">
		<Global
			styles={ css`
				body {
					--masterbar-height: 72px;
				}
			` }
		/>
		<WordPressLogo className="checkout-thank-you__logo" size={ 24 } />
		{ canGoBack && backText && onClick && (
			<Item
				icon="chevron-left"
				onClick={ onClick }
				className="checkout-thank-you__item"
				wrapperClassName="checkout-thank-you__item-wrapper"
			>
				{ backText }
			</Item>
		) }
		{ showContact && contact }
	</Masterbar>
);

export default MasterbarStyled;
