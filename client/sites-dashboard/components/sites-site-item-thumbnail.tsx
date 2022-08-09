import { SiteThumbnail } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import Image from 'calypso/components/image';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteStatus } from '../hooks/use-site-status';

const NoIcon = styled.div( {
	fontSize: 'xx-large',
} );

interface SiteItemThumbnailProps extends ComponentProps< typeof SiteThumbnail > {
	site: SiteExcerptData;
}

export const SiteItemThumbnail = ( { site, ...props }: SiteItemThumbnailProps ) => {
	const { __ } = useI18n();
	const { status } = useSiteStatus( site );

	const shouldUseScreenshot = status === 'public';

	return (
		<SiteThumbnail
			{ ...props }
			mShotsUrl={ shouldUseScreenshot ? site.URL : undefined }
			alt={ site.name }
			bgColorImgUrl={ site.icon?.img }
		>
			{ site.icon ? (
				<Image
					src={ site.icon.img }
					alt={ __( 'Site Icon' ) }
					style={ { height: '50px', width: '50px' } }
				/>
			) : (
				<NoIcon role={ 'img' } aria-label={ __( 'Site Icon' ) }>
					{ getFirstGrapheme( site.name ) }
				</NoIcon>
			) }
		</SiteThumbnail>
	);
};

function getFirstGrapheme( input: string ) {
	// TODO: once we're on Typescript 4.7 we should be able to add this comment:
	//    /// <reference lib="es2022.intl" />
	// to the top of the file to get access to the types for Intl.Segmenter
	// which where added in microsoft/TypeScript#48800
	// In the mean time we need to use the `any` type to fix type errors in CI.

	try {
		const segmenter = new ( Intl as any ).Segmenter();
		const segments = segmenter.segment( input );
		return ( Array.from( segments )[ 0 ] as any ).segment;
	} catch {
		// Intl.Segmenter is not available in all browsers
		return input.charAt( 0 );
	}
}
