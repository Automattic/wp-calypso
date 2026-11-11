import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { Text } from '../../../components/text';

import './style.scss';

// Tables remount their cells whenever their columns change, so remember the previews that
// already loaded to show them again without the placeholder flashing.
const loadedScreenshots = new Map< string, string >();

export default function SiteScreenshot( {
	url,
	alt,
	compact = false,
	decorative = false,
	fill = false,
	width,
	height,
}: {
	url: string;
	alt: string;
	compact?: boolean;
	decorative?: boolean;
	/** Fill the parent's box instead of keeping a 16:9 ratio. */
	fill?: boolean;
	/** A fixed size in pixels, set inline so it holds inside tables that size their media. */
	width?: number;
	height?: number;
} ) {
	const shotWidth = compact ? 300 : 1200;
	const shotHeight = compact ? 180 : 675;
	const baseSrc = `https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?w=${ shotWidth }&h=${ shotHeight }&vpw=1200&vph=800`;
	const loadedSrc = loadedScreenshots.get( baseSrc );
	const [ attempt, setAttempt ] = useState( 0 );
	const [ ready, setReady ] = useState( !! loadedSrc );
	const [ failed, setFailed ] = useState( false );
	const src = loadedSrc ?? `${ baseSrc }&countToRefresh=${ attempt }`;

	useEffect( () => {
		if ( ready ) {
			return;
		}
		const controller = new AbortController();
		const timeout = setTimeout(
			async () => {
				try {
					const response = await fetch( src, {
						method: 'HEAD',
						cache: 'no-cache',
						signal: controller.signal,
					} );
					if ( response.status >= 400 ) {
						setFailed( true );
					} else if ( response.redirected ) {
						if ( attempt < 8 ) {
							setAttempt( attempt + 1 );
						} else {
							setFailed( true );
						}
					} else {
						loadedScreenshots.set( baseSrc, src );
						setReady( true );
					}
				} catch {
					if ( ! controller.signal.aborted ) {
						setFailed( true );
					}
				}
			},
			attempt === 0 ? 0 : 1200
		);

		return () => {
			controller.abort();
			clearTimeout( timeout );
		};
	}, [ baseSrc, src, attempt, ready ] );
	const statusText = failed ? __( 'Preview unavailable' ) : __( 'Preparing preview…' );
	const placeholder = decorative ? null : (
		<Text size={ 11 } variant="muted">
			{ statusText }
		</Text>
	);

	return (
		<VStack
			spacing={ 0 }
			alignment="center"
			justify="center"
			className="agency-site-screenshot"
			data-fill={ fill || undefined }
			aria-hidden={ decorative || undefined }
			style={ width && height ? { width, height, minWidth: width, minHeight: height } : undefined }
		>
			{ ready && ! failed ? (
				<img
					className="agency-site-screenshot__image"
					src={ src }
					alt={ alt }
					loading="lazy"
					onError={ () => {
						loadedScreenshots.delete( baseSrc );
						setFailed( true );
					} }
					style={ width && height ? { width, height } : undefined }
				/>
			) : (
				placeholder
			) }
		</VStack>
	);
}
