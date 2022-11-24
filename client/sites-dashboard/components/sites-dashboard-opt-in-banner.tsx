import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import Banner from 'calypso/components/banner';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesDashboardOptInBannerProps {
	sites: SiteExcerptData[];
	className: string;
}

const SitesBanner = styled( Banner )( {
	width: 'auto',
	margin: '0 0 32px 0',

	'.banner__close-icon': {
		position: 'static',
		top: 'unset',
		left: 'unset',
		marginLeft: '24px',
		order: 3,
		width: '18px',
	},

	'.banner__title': {
		fontWeight: 'normal',
	},

	'.banner__action': {
		marginTop: 0,
		marginLeft: '32px',
		display: 'flex',
	},
} );

export const SitesDashboardOptInBanner = ( {
	sites,
	className,
}: SitesDashboardOptInBannerProps ) => {
	const { __ } = useI18n();

	if ( sites.length < 2 ) {
		return null;
	}

	return (
		<div className={ className }>
			<SitesBanner
				callToAction={ __( 'Yes, make it my landing page' ) }
				primaryButton={ false }
				dismissWithoutSavingPreference
				disableHref
				event="calypso_sites_as_landing_page"
				showIcon={ false }
				onClick={ () => {} }
				onDismiss={ () => {} }
				title={ __( 'Do you want to make this page the default when you visit WordPress.com?' ) }
				tracksImpressionName="calypso_sites_as_landing_page_seen"
				tracksClickName="calypso_sites_as_landing_page_accepted"
				tracksDismissName="calypso_sites_as_landing_page_rejected"
			/>
		</div>
	);
};
