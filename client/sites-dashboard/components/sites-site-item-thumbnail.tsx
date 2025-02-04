import { SiteThumbnail, DEFAULT_THUMBNAIL_SIZE } from '@automattic/components';
import { getSiteLaunchStatus } from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import Image from 'calypso/components/image';
import { getFirstGrapheme } from 'calypso/lib/string';
import { P2Thumbnail } from './p2-thumbnail';
import { SiteComingSoon } from './sites-site-coming-soon';
import type { SitesDisplayMode } from './sites-display-mode-switcher';
import type { SiteExcerptData } from '@automattic/sites';

const NoIcon = styled.div( {
	fontSize: 'xx-large',
	textTransform: 'uppercase',
} );

const disallowSelection = css( {
	userSelect: 'none',
} );

interface SiteItemThumbnailProps extends Omit< ComponentProps< typeof SiteThumbnail >, 'alt' > {
	displayMode: SitesDisplayMode;
	site: SiteExcerptData;
	alt?: string;
	showPlaceholder?: boolean;
}

export const SiteItemThumbnail = ( {
	displayMode,
	showPlaceholder,
	site,
	...props
}: SiteItemThumbnailProps ) => {
	const { __ } = useI18n();
	const classes = clsx( props.className, disallowSelection );

	// Allow parent component to lazy load the entire component.
	if ( showPlaceholder === true ) {
		return (
			<SiteThumbnail
				{ ...props }
				className={ classes }
				alt={ site.title || __( 'Site thumbnail' ) }
			>
				<NoIcon role="img" aria-label={ __( 'Site Icon' ) }>
					{ getFirstGrapheme( site.title ?? '' ) }
				</NoIcon>
			</SiteThumbnail>
		);
	}

	const shouldUseScreenshot = getSiteLaunchStatus( site ) === 'public';

	let siteUrl = site.URL;
	if ( site.options?.updated_at ) {
		const updatedAt = new Date( site.options.updated_at );
		updatedAt.setMinutes( 0 );
		updatedAt.setSeconds( 0 );
		siteUrl = addQueryArgs( siteUrl, {
			v: updatedAt.getTime() / 1000,

			// This combination of flags stops free site headers and cookie banners from appearing.
			iframe: true,
			preview: true,
			hide_banners: true,
		} );
	}

	if ( site.is_coming_soon ) {
		const style = {
			width: props.width || DEFAULT_THUMBNAIL_SIZE.width,
			height: props.height || DEFAULT_THUMBNAIL_SIZE.height,
		};
		return (
			<SiteComingSoon
				{ ...props }
				className={ classes }
				siteName={ site.name }
				width={ style.width }
				height={ style.height }
				lang={ site.lang }
			/>
		);
	}

	function renderFallback() {
		if (
			site.p2_thumbnail_elements &&
			site.options?.is_wpforteams_site &&
			getSiteLaunchStatus( site ) !== 'public'
		) {
			return (
				<P2Thumbnail
					site={ site }
					displayMode={ displayMode }
					alt={ site.title || __( 'Site thumbnail' ) }
					sizesAttr={ props.sizesAttr }
				/>
			);
		}

		if ( site.icon ) {
			return (
				<Image
					src={ site.icon.img }
					alt={ __( 'Site Icon' ) }
					style={ { height: '50px', width: '50px' } }
				/>
			);
		}

		return (
			<NoIcon role="img" aria-label={ __( 'Site Icon' ) }>
				{ getFirstGrapheme( site.title ?? '' ) }
			</NoIcon>
		);
	}

	return (
		<SiteThumbnail
			{ ...props }
			className={ classes }
			mShotsUrl={ shouldUseScreenshot ? siteUrl : undefined }
			alt={ site.title || __( 'Site thumbnail' ) }
			bgColorImgUrl={ site.icon?.img }
		>
			{ renderFallback() }
		</SiteThumbnail>
	);
};
