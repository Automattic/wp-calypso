import { SiteThumbnail } from '@automattic/components';
import { getSiteLaunchStatus } from '@automattic/sites';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { ComponentProps } from 'react';
import Image from 'calypso/components/image';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const NoIcon = styled.div( {
	fontSize: 'xx-large',
	textTransform: 'uppercase',
	userSelect: 'none',
} );

interface SiteItemThumbnailProps extends Omit< ComponentProps< typeof SiteThumbnail >, 'alt' > {
	site: SiteExcerptData;
	alt?: string;
}

export const SiteItemThumbnail = ( { site, ...props }: SiteItemThumbnailProps ) => {
	const { __ } = useI18n();

	const siteUrl = addQueryArgs( `https://public-api.wordpress.com/wpcom/v2/screenshots`, {
		site_url: site.URL,
	} );

	return (
		<SiteThumbnail
			{ ...props }
			mShotsUrl={ siteUrl }
			alt={ site.title || __( 'Site thumbnail' ) }
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
					{ getFirstGrapheme( site.title ?? '' ) }
				</NoIcon>
			) }
		</SiteThumbnail>
	);
};

function getFirstGrapheme( input: string ) {
	if ( 'Segmenter' in Intl ) {
		const segmenter = new Intl.Segmenter();
		const [ firstSegmentData ] = segmenter.segment( input );

		return firstSegmentData?.segment ?? '';
	}

	const codePoint = input.codePointAt( 0 );
	if ( codePoint ) {
		return String.fromCodePoint( codePoint );
	}
	return '';
}
