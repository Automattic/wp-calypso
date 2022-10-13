import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
const SITE_RENEW_NAG_IN_VIEW = 'calypso_sites_dashboard_site_renew_nag_inview';
const SITE_RENEW_NAG_ON_CLICK = 'calypso_sites_dashboard_site_renew_nag_click';

interface SiteRenewProps {
	site: SiteExcerptData;
}

const SiteRenewContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const SiteRenewLink = styled.a( {
	whiteSpace: 'nowrap',
	textDecoration: 'underline',
} );

const SiteRenewNotice = styled.div`
	display: flex;
	align-items: center;
	color: #ea303f;
	margin-top: -6px;
	> .gridicon {
		margin-right: 4px;
	}
`;

export const SiteRenewNag = ( { site }: SiteRenewProps ) => {
	const { __ } = useI18n();
	const { ref, inView: inViewOnce } = useInView( { triggerOnce: true } );

	const isSiteOwner = site.plan?.user_is_owner || false;

	useEffect( () => {
		if ( inViewOnce ) {
			recordTracksEvent( SITE_RENEW_NAG_IN_VIEW, { is_site_owner: isSiteOwner } );
		}
	}, [ inViewOnce, isSiteOwner ] );

	const renewText = __( 'Renew' );
	const expiredText = __( 'Expired' );
	return (
		<SiteRenewContainer ref={ ref }>
			<SiteRenewNotice>
				<Gridicon icon="notice" />
				{ `${ site.plan?.product_name_short } - ${ expiredText }` }
			</SiteRenewNotice>
			{ isSiteOwner && (
				<SiteRenewLink
					onClick={ () => {
						recordTracksEvent( SITE_RENEW_NAG_ON_CLICK );
					} }
					href={ `/checkout/${ site.slug }` }
					title={ renewText }
				>
					{ renewText }
				</SiteRenewLink>
			) }
		</SiteRenewContainer>
	);
};
