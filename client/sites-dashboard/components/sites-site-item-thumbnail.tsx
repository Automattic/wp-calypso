import { SiteThumbnail } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import Image from 'calypso/components/image';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteStatus } from '../hooks/use-site-status';

const NoIcon = styled.div( {
	fontSize: 'xx-large',
	textTransform: 'uppercase',
	userSelect: 'none',
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
	try {
		const segmenter = new Intl.Segmenter();
		const [ firstSegmentData ] = segmenter.segment( input );

		return firstSegmentData.segment;
	} catch {
		// Intl.Segmenter is not available in all browsers
		return input.charAt( 0 );
	}
}
