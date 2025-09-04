import { type TrademarkClaimsNoticeInfo } from '@automattic/api-core';
import { Button, ScrollLock, Modal } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useRef } from 'react';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { useHasScrolledToEnd } from '../../hooks/use-has-scrolled-to-end';
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
					<p>
						{ __(
							"To continue, you must agree not to infringe on the trademark holders' rights. Please review and acknowledge the following notice."
						) }
					</p>
					<p>
						{ __(
							'You have received this Trademark Notice because you have applied for a domain name which matches at least one trademark record submitted to the Trademark Clearinghouse.'
						) }
					</p>
					<p style={ { fontStyle: 'italic', fontWeight: 'bold' } }>
						{ __(
							'You may or may not be entitled to register the domain name depending on your intended use and whether it is the same or significantly overlaps with the trademarks listed below. Your rights to register this domain name may or may not be protected as noncommercial use or “fair use” by the laws of your country.'
						) }
					</p>
					<p>
						{ __(
							'Please read the trademark information below carefully, including the trademarks, jurisdictions, and goods and services for which the trademarks are registered. Please be aware that not all jurisdictions review trademark applications closely, so some of the trademark information below may exist in a national or regional registry which does not conduct a thorough or substantive review of trademark rights prior to registration. If you have questions, you may want to consult an attorney or legal expert on trademarks and intellectual property for guidance.'
						) }
					</p>
					<p>
						{ __(
							'If you continue with this registration, you represent that, you have received and you understand this notice and to the best of your knowledge, your registration and use of the requested domain name will not infringe on the trademark rights listed below. The following marks are listed in the Trademark Clearinghouse:'
						) }
					</p>
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
