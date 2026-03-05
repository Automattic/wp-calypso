import {
	Modal,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useReferralEmailPreview from './hooks/use-referral-email-preview';
import type { ShoppingCartItem, TermPricingType } from '../types';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	clientMessage: string;
	checkoutItems: ShoppingCartItem[];
	termPricing: TermPricingType;
	logoUrl: string | null;
};

// This is to remove the margin from the table cells.
// We need to do this because removing the style from the table cells
// will affect the email being rendered on the client's email client.
// We need to use !important to override the style as the style is being applied as inline style.
const PREVIEW_IFRAME_CSS = `
	:root {
		color-scheme: light !important;
	}

	html,
	body {
		background: #ffffff !important;
		color: #101517 !important;
	}

	table {
		margin: 0;
		background: none !important;
	}

	td.container {
		margin: 0 !important;
	}

	a {
		pointer-events: none;
		cursor: default;
	}

	/* Scale so 600px email fits: scale = viewport width / 600px (capped at 1). */
	@media (max-width: 600px) {
		html {
			transform: scale(calc(100vw / 600px));
			transform-origin: 0 0;
		}
	}
`;

const VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1">';

function injectPreviewStyles( html: string ): string {
	const styleTag = `<style>${ PREVIEW_IFRAME_CSS }</style>`;

	if ( html.includes( '</head>' ) ) {
		return html.replace( '</head>', `${ VIEWPORT_META }${ styleTag }</head>` );
	}

	return `${ VIEWPORT_META }${ styleTag }${ html }`;
}

export default function ReferralEmailPreviewModal( {
	isOpen,
	onClose,
	clientMessage,
	checkoutItems,
	termPricing,
	logoUrl,
}: Props ) {
	const translate = useTranslate();
	const [ iframeHeight, setIframeHeight ] = useState( 900 );
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const resizeObserverRef = useRef< ResizeObserver | null >( null );

	const productIds = useMemo(
		() => checkoutItems.map( ( item ) => item.product_id ),
		[ checkoutItems ]
	);

	const { data, isLoading, error } = useReferralEmailPreview( {
		productIds,
		greetingLine: clientMessage.trim(),
		logoUrl,
		termPricing,
		enabled: isOpen,
	} );

	const previewSrcDoc = useMemo(
		() => ( data?.html ? injectPreviewStyles( data.html ) : '' ),
		[ data?.html ]
	);

	const updateIframeHeight = useCallback( () => {
		const iframe = iframeRef.current;
		const doc = iframe?.contentDocument;
		const win = iframe?.contentWindow;

		if ( ! doc || ! win ) {
			return;
		}

		const { body, documentElement } = doc;
		const scrollHeight = body?.scrollHeight ?? documentElement?.scrollHeight ?? 0;
		if ( scrollHeight <= 0 ) {
			return;
		}

		// When content is scaled (viewport ≤ 600px), visual height = scrollHeight * scale.
		const viewportWidth = win.innerWidth;
		const scale = viewportWidth <= 600 ? viewportWidth / 600 : 1;
		const nextHeight = Math.ceil( scrollHeight * scale );

		setIframeHeight( nextHeight );
	}, [] );

	useEffect( () => {
		if ( ! previewSrcDoc ) {
			return;
		}

		setIframeHeight( 900 );

		return () => {
			resizeObserverRef.current?.disconnect();
			resizeObserverRef.current = null;
		};
	}, [ previewSrcDoc ] );

	const handleIframeLoad = useCallback( () => {
		updateIframeHeight();

		const iframe = iframeRef.current;
		const body = iframe?.contentDocument?.body;
		if ( ! body || typeof ResizeObserver === 'undefined' ) {
			return;
		}

		resizeObserverRef.current?.disconnect();
		resizeObserverRef.current = new ResizeObserver( updateIframeHeight );
		resizeObserverRef.current.observe( body );
	}, [ updateIframeHeight ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ translate( 'Preview referral email' ) }
			onRequestClose={ onClose }
			className="referral-email-preview-modal"
			bodyOpenClassName="referral-email-preview-modal-body"
			isFullScreen
		>
			<VStack spacing={ 0 } className="referral-email-preview">
				<div
					style={ {
						width: '100%',
						maxWidth: '600px',
						marginInline: 'auto',
						background: 'var(--color-surface)',
						borderRadius: '8px',
						overflow: 'hidden',
					} }
				>
					{ isLoading && (
						<Text as="div" style={ { padding: '40px', textAlign: 'center' } }>
							{ translate( 'Loading preview' ) }
						</Text>
					) }
					{ error && (
						<Text
							as="div"
							style={ { padding: '40px', textAlign: 'center', color: 'var(--color-error)' } }
						>
							{ translate( 'Failed to load email preview. Please try again.' ) }
						</Text>
					) }
					{ previewSrcDoc && (
						<iframe
							ref={ iframeRef }
							title={ translate( 'Referral email preview' ) }
							srcDoc={ previewSrcDoc }
							sandbox="allow-popups allow-top-navigation-by-user-activation allow-same-origin"
							scrolling="no"
							onLoad={ handleIframeLoad }
							style={ {
								width: '100%',
								height: `${ iframeHeight }px`,
								border: '0',
								overflow: 'hidden',
								display: 'block',
							} }
						/>
					) }
				</div>
			</VStack>
		</Modal>
	);
}
