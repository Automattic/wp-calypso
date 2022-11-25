import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import Notice from 'calypso/components/notice';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesDashboardOptInBannerProps {
	sites: SiteExcerptData[];
}

const SitesNotice = styled( Notice )( {
	marginBlockStart: '32px',
	backgroundColor: 'var(--color-neutral-0)',
	color: 'var(--color-text)',

	'.notice__icon-wrapper': {
		paddingInlineStart: '8px',
		background: 'transparent !important',
		color: 'var(--color-accent)',
	},

	'.notice__content': {
		paddingBlock: '16px',
		paddingInline: '8px',
		display: 'flex',
		alignItems: 'center',
	},
} );

const NoticeActions = styled.div( {
	display: 'flex',
	gap: '16px',
	alignItems: 'center',
	padding: '16px',
} );

export const SitesDashboardOptInBanner = ( { sites }: SitesDashboardOptInBannerProps ) => {
	const { __ } = useI18n();

	if ( sites.length < 2 ) {
		return null;
	}

	return (
		<SitesNotice
			status="is-info"
			text={ __( 'Do you want to make this page your default when visiting WordPress.com?' ) }
			icon="heart"
			showDismiss={ false }
		>
			<NoticeActions>
				<Button borderless>{ __( 'No, thanks' ) }</Button>
				<Button>{ __( 'Yes, make it my home' ) }</Button>
			</NoticeActions>
		</SitesNotice>
	);
};
