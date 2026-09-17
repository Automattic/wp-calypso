import { Button } from '@wordpress/components';
import { cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { DomainSearchTrademarkClaimsModal } from '../../ui';
import type { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';
import type { ComponentProps } from 'react';

type NamePulseCartButtonProps = Omit< ReturnType< typeof useNamePulseAddToCart >, 'error' > & {
	domainName: string;
	size?: ComponentProps< typeof Button >[ 'size' ];
};

export const NamePulseCartButton = ( {
	domainName,
	size,
	inCart,
	isPending,
	toggleCart,
	trademarkClaimsNoticeInfo,
	acceptTrademarkClaim,
	dismissTrademarkClaim,
}: NamePulseCartButtonProps ) => {
	const { __ } = useI18n();

	return (
		<>
			<Button
				className="name-pulse-row__cart"
				icon={ cartIcon }
				label={ inCart ? __( 'Remove from cart' ) : __( 'Add to cart' ) }
				variant={ inCart ? 'primary' : undefined }
				size={ size }
				isBusy={ isPending }
				disabled={ isPending }
				aria-pressed={ inCart }
				onClick={ toggleCart }
			/>
			{ trademarkClaimsNoticeInfo && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
					onAccept={ acceptTrademarkClaim }
					onClose={ dismissTrademarkClaim }
				/>
			) }
		</>
	);
};
