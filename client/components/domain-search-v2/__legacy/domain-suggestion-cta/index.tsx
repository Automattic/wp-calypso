import { TrademarkClaimsNoticeInfo } from '@automattic/api-core';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
	DomainSearchTrademarkClaimsModal,
} from '@automattic/domain-search';
import { useDomainSearch } from '../domain-search';
import { useFocusedCartAction } from '../use-focused-cart-action';

export interface DomainSuggestionCTAProps {
	uuid: string;
	onClick?( action: 'add-to-cart' | 'continue' ): void;
	disabled?: boolean;
	trademarkClaimsNoticeInfo?: {
		domain: string;
		trademarkClaimsNoticeInfo: TrademarkClaimsNoticeInfo;
	};
	onAcceptTrademarkClaim: () => void;
	onRejectTrademarkClaim: () => void;
}

export const DomainSuggestionCTA = ( {
	uuid,
	onClick,
	disabled,
	trademarkClaimsNoticeInfo,
	onAcceptTrademarkClaim,
	onRejectTrademarkClaim,
}: DomainSuggestionCTAProps ) => {
	const { cart, onContinue } = useDomainSearch();
	const { isBusy, errorMessage, callback } = useFocusedCartAction( () => {
		onClick?.( 'add-to-cart' );
		cart.onAddItem( uuid );
	} );

	const isDomainOnCart = cart.hasItem( uuid );

	if ( isDomainOnCart ) {
		const handleContinueClick = () => {
			onClick?.( 'continue' );
			onContinue();
		};

		return (
			<DomainSuggestionContinueCTA
				disabled={ disabled || cart.isBusy }
				onClick={ handleContinueClick }
			/>
		);
	}

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ callback } />;
	}

	return (
		<>
			<DomainSuggestionPrimaryCTA
				onClick={ callback }
				disabled={ disabled || cart.isBusy }
				isBusy={ isBusy }
			/>
			{ trademarkClaimsNoticeInfo?.domain === uuid && (
				<DomainSearchTrademarkClaimsModal
					domainName={ uuid }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo.trademarkClaimsNoticeInfo }
					onAccept={ onAcceptTrademarkClaim }
					onClose={ onRejectTrademarkClaim }
				/>
			) }
		</>
	);
};
