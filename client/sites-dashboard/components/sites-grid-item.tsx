import { Button } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { displaySiteUrl } from '../utils';
import { SitesGridTile } from './sites-grid-tile';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';
import TransferNoticeWrapper from './sites-transfer-notice-wrapper';
import { WithAtomicTransfer } from './with-atomic-transfer';
import type { SiteExcerptData } from '@automattic/sites';

const SIZES_ATTR = [
	'(min-width: 1345px) calc((1280px - 64px) / 3)',
	'(min-width: 960px) calc((100vw - 128px) / 3)',
	'(min-width: 780px) calc((100vw - 96px) / 2)',
	'(min-width: 660px) calc((100vw - 64px) / 2)',
	'calc(100vw - 32px)',
].join( ', ' );

const ASPECT_RATIO = 16 / 11;

const THUMBNAIL_DIMENSION = {
	width: 401,
	height: 401 / ASPECT_RATIO,
};

const selectAction = css( {
	display: 'flex',
	gap: '8px',
	alignItems: 'center',
	marginInlineStart: 'auto',
	button: {
		whiteSpace: 'nowrap',
	},
} );

export const siteThumbnail = css( {
	aspectRatio: '16 / 11',
	width: '100%',
	height: 'auto',
	boxSizing: 'border-box',
} );

const SitesGridItemSecondary = styled.div( {
	display: 'flex',
	gap: '20px',
	fontSize: '14px',
	justifyContent: 'space-between',
} );

interface SitesGridItemProps {
	site: SiteExcerptData;
	onSiteSelectBtnClick: ( site: SiteExcerptData ) => void;
}

export const SitesGridItem = memo( ( props: SitesGridItemProps ) => {
	const { __ } = useI18n();
	const { site, onSiteSelectBtnClick } = props;
	const { ref, inView } = useInView( { triggerOnce: true } );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}
	return (
		<SitesGridTile
			ref={ ref }
			leading={
				<>
					<div>
						<SiteItemThumbnail
							displayMode="tile"
							className={ siteThumbnail }
							showPlaceholder={ ! inView }
							site={ site }
							width={ THUMBNAIL_DIMENSION.width }
							height={ THUMBNAIL_DIMENSION.height }
							sizesAttr={ SIZES_ATTR }
						/>
					</div>
				</>
			}
			primary={
				<>
					<SiteName fontSize={ 16 }>{ site.title }</SiteName>
					<div className={ selectAction }>
						<Button compact primary onClick={ () => onSiteSelectBtnClick( site ) }>
							{ __( 'Select this site' ) }
						</Button>
					</div>
				</>
			}
			secondary={
				<SitesGridItemSecondary>
					<SiteUrl href={ siteUrl } title={ siteUrl }>
						<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
					</SiteUrl>
					<WithAtomicTransfer site={ site }>
						{ ( result ) => {
							if ( result.wasTransferring ) {
								return <TransferNoticeWrapper { ...result } />;
							}
							return <></>;
						} }
					</WithAtomicTransfer>
				</SitesGridItemSecondary>
			}
		/>
	);
} );
