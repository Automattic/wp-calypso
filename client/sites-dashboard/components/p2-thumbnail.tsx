import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useInView } from 'react-intersection-observer';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const Container = styled.div( {
	userSelect: 'none',
	position: 'relative',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	backgroundSize: 'contain',
	backgroundRepeat: 'no-repeat',
	backgroundPosition: 'top center',
} );

const SiteIcon = styled.img( {
	background: '#fff',
	padding: '3px',
	borderRadius: '3px',
	position: 'absolute',
	bottom: '16px',
	left: '16px',
} );

interface P2ThumbnailProps {
	site: SiteExcerptData;
}

export function P2Thumbnail( { site }: P2ThumbnailProps ) {
	const { __ } = useI18n();
	const { ref, inView } = useInView( { triggerOnce: true } );
	const { data, isLoading } = useP2ThumbnailElementsQuery( site.ID, { enabled: inView } );

	const inlineStyles =
		isLoading || ! data
			? {}
			: {
					backgroundColor: data.color_sidebar_background,
					backgroundImage: data.header_image ? `url("${ data.header_image }")` : undefined,
			  };

	const siteIcon =
		isLoading || ! data || ! site.icon ? null : (
			<SiteIcon src={ site.icon.img } alt="" width="64" height="64" />
		);

	return (
		<Container ref={ ref } role={ 'img' } aria-label={ __( 'Site Icon' ) } style={ inlineStyles }>
			{ siteIcon }
		</Container>
	);
}

interface P2ThumbnailElements {
	color_sidebar_background: string;
	header_image: string | null;
}

function useP2ThumbnailElementsQuery( siteId: number, { enabled = true } ) {
	return useQuery(
		[ 'p2-thumbnail-elements', siteId ],
		(): Promise< P2ThumbnailElements > =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/p2-thumbnail-elements`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled,
		}
	);
}
