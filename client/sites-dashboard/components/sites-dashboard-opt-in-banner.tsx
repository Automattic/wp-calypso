import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';
import {
	SITES_AS_LANDING_PAGE_DEFAULT_VALUE,
	SITES_AS_LANDING_PAGE_PREFERENCE,
} from 'calypso/state/sites/selectors/has-sites-as-landing-page';

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

const ONE_DAY_IN_MILLISECONDS = 86400 * 1000;

const hasDismissedTheBannerRecently = ( {
	updatedAt,
}: typeof SITES_AS_LANDING_PAGE_DEFAULT_VALUE ) => {
	const fourteenDaysAgo = new Date().valueOf() - ONE_DAY_IN_MILLISECONDS * 14;

	return updatedAt > fourteenDaysAgo;
};

export const SitesDashboardOptInBanner = ( { sites }: SitesDashboardOptInBannerProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ landingPagePreference, setLandingPagePreference ] = useAsyncPreference( {
		defaultValue: SITES_AS_LANDING_PAGE_DEFAULT_VALUE,
		preferenceName: SITES_AS_LANDING_PAGE_PREFERENCE,
	} );

	if (
		sites.length < 2 ||
		landingPagePreference === 'none' ||
		landingPagePreference.useSitesAsLandingPage ||
		hasDismissedTheBannerRecently( landingPagePreference )
	) {
		return null;
	}

	const handleAccept = () => {
		setLandingPagePreference( {
			useSitesAsLandingPage: true,
			updatedAt: new Date().valueOf(),
		} );
		dispatch( recordTracksEvent( `${ EVENT_PREFIX }_accepted` ) );
	};

	const handleDismiss = () => {
		setLandingPagePreference( {
			useSitesAsLandingPage: false,
			updatedAt: new Date().valueOf(),
		} );
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
