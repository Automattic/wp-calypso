import { referralEmailPreviewQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Modal, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '../../../components/text';
import type { TermPricing } from '../use-term-pricing';

interface Props {
	agencyId: number;
	productIds: number[];
	greetingLine: string;
	logoUrl?: string;
	term: TermPricing;
	onClose: () => void;
}

// The email is rendered by the server for mail clients, with inline styles;
// these only make it sit well in a modal and stay light in dark mode.
const PREVIEW_CSS = `
	:root { color-scheme: light !important; }
	html, body { background: #ffffff !important; color: #101517 !important; }
	table { margin: 0; background: none !important; }
	td.container { margin: 0 !important; }
	a { pointer-events: none; cursor: default; }
	@media (max-width: 600px) {
		html { transform: scale(calc(100vw / 600px)); transform-origin: 0 0; }
	}
`;

function withPreviewStyles( html: string ) {
	const head = `<meta name="viewport" content="width=device-width, initial-scale=1"><style>${ PREVIEW_CSS }</style>`;
	return html.includes( '</head>' ) ? html.replace( '</head>', `${ head }</head>` ) : head + html;
}

/**
 * The email the client gets, as the server renders it, in a sandboxed frame
 * sized to its content.
 */
export default function ReferralEmailPreviewModal( {
	agencyId,
	productIds,
	greetingLine,
	logoUrl,
	term,
	onClose,
}: Props ) {
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ height, setHeight ] = useState( 900 );

	const { data, isLoading, isError } = useQuery(
		referralEmailPreviewQuery( agencyId, {
			product_ids: productIds,
			greeting_line: greetingLine,
			logo_url: logoUrl,
			term_pricing: term,
		} )
	);
	const srcDoc = useMemo( () => ( data?.html ? withPreviewStyles( data.html ) : '' ), [ data ] );

	const fitToContent = useCallback( () => {
		const doc = iframeRef.current?.contentDocument;
		const win = iframeRef.current?.contentWindow;
		const scrollHeight = doc?.body?.scrollHeight ?? doc?.documentElement?.scrollHeight ?? 0;
		if ( ! win || scrollHeight <= 0 ) {
			return;
		}
		// Below 600px the email is scaled down, so its visual height shrinks too.
		const scale = win.innerWidth <= 600 ? win.innerWidth / 600 : 1;
		setHeight( Math.ceil( scrollHeight * scale ) );
	}, [] );

	const observerRef = useRef< ResizeObserver | null >( null );

	// The frame's document only exists after load, so the observer is attached there.
	const handleLoad = useCallback( () => {
		fitToContent();
		const body = iframeRef.current?.contentDocument?.body;
		if ( ! body || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		observerRef.current?.disconnect();
		observerRef.current = new ResizeObserver( fitToContent );
		observerRef.current.observe( body );
	}, [ fitToContent ] );

	useEffect( () => () => observerRef.current?.disconnect(), [] );

	return (
		<Modal title={ __( 'Preview referral email' ) } onRequestClose={ onClose } isFullScreen>
			<div className="referral-checkout__email-preview">
				<VStack spacing={ 4 } alignment="center" className="referral-checkout__email-preview-card">
					{ isLoading && <Spinner /> }
					{ isError && (
						<Text intent="error">{ __( 'Failed to load email preview. Please try again.' ) }</Text>
					) }
					{ srcDoc && (
						<iframe
							ref={ iframeRef }
							title={ __( 'Referral email preview' ) }
							srcDoc={ srcDoc }
							sandbox="allow-same-origin"
							scrolling="no"
							onLoad={ handleLoad }
							style={ {
								display: 'block',
								width: '100%',
								height: `${ height }px`,
								border: 0,
								overflow: 'hidden',
							} }
						/>
					) }
				</VStack>
			</div>
		</Modal>
	);
}
