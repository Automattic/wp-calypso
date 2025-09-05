import { type TrademarkClaimsNoticeInfo } from '@automattic/api-core';
import { Button, ScrollLock, Modal } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useRef } from 'react';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { useHasScrolledToEnd } from '../../hooks/use-has-scrolled-to-end';
import { TRADE_MARK_CLAIMS_MODAL_COPY } from './constants';
import { TrademarkClaimsModalContent } from './content';

import './style.scss';

export const DomainSearchTrademarkClaimsModal = ( {
	domainName,
	onAccept,
	onClose,
	trademarkClaimsNoticeInfo,
}: {
	domainName: string;
	onAccept: () => void;
	onClose: () => void;
	trademarkClaimsNoticeInfo: TrademarkClaimsNoticeInfo;
} ) => {
	const contentRef = useRef< HTMLDivElement >( null );
	const hasScrolledToEnd = useHasScrolledToEnd( contentRef );

	const listContext = useDomainSuggestionContainerContext();
	const isSmallOrBigger = useViewportMatch( 'small', '>=' );

	const getMaxWidth = () => {
		if ( isSmallOrBigger ) {
			return listContext?.currentWidth ?? undefined;
		}

		return undefined;
	};

	return (
		<Modal
			style={ { maxWidth: getMaxWidth() } }
			overlayClassName="domain-search-trademark-claims-modal"
			title={
				// translators: %s is the domain name
				sprintf( __( '%s matches a trademark.' ), domainName )
			}
			onRequestClose={ onClose }
		>
			<div className="domain-search-trademark-claims-modal__body">
				<div className="domain-search-trademark-claims-modal__content" ref={ contentRef }>
					<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.PREAMBLE }</p>
					<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.REASON }</p>
					<p style={ { fontStyle: 'italic', fontWeight: 'bold' } }>
						{ TRADE_MARK_CLAIMS_MODAL_COPY.ENTITLEMENT }
					</p>
					<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.INSTRUCTIONS }</p>
					<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.CONSENT }</p>
					<TrademarkClaimsModalContent trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo } />
				</div>
				<div className="domain-search-trademark-claims-modal__actions">
					<Button
						variant="primary"
						onClick={ onAccept }
						disabled={ ! hasScrolledToEnd }
						__next40pxDefaultSize
					>
						{ __( 'Acknowledge trademark' ) }
					</Button>
				</div>
			</div>
			<ScrollLock />
		</Modal>
	);
};

export { TRADE_MARK_CLAIMS_MODAL_COPY };
