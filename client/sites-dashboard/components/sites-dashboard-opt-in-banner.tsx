import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

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

const EVENT_PREFIX = 'calypso_sites_as_landing_page';

export const SitesDashboardOptInBanner = ( { sites }: SitesDashboardOptInBannerProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	if ( sites.length < 2 ) {
		return null;
	}

	const handleAccept = () => {
		dispatch( recordTracksEvent( `${ EVENT_PREFIX }_accepted` ) );
	};

	const handleDismiss = () => {
		dispatch( recordTracksEvent( `${ EVENT_PREFIX }_rejected` ) );
	};

	return (
		<>
			<TrackComponentView eventName={ `${ EVENT_PREFIX }_seen` } />
			<SitesNotice
				status="is-info"
				text={ __( 'Do you want to make this page your default when visiting WordPress.com?' ) }
				icon="heart"
				showDismiss={ false }
			>
				<NoticeActions>
					<Button borderless onClick={ handleDismiss }>
						{ __( 'No, thanks' ) }
					</Button>
					<Button onClick={ handleAccept }>{ __( 'Yes, make it my home' ) }</Button>
				</NoticeActions>
			</SitesNotice>
		</>
	);
};
