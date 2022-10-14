import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
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
	white-space: break-spaces;
	justify-items: flex-start;
	gap: 4px;
	margin-top: -5px;
`;

const SiteRenewLink = styled.a( {
	whiteSpace: 'nowrap',
	textDecoration: 'underline',
} );

const IconContainer = styled.div`
	color: #ea303f;
	margin-top: -2px;
`;

const SiteRenewNotice = styled.div`
	display: flex;
	flex-direction: column;
	color: #ea303f;
	gap: 4px;
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
	return (
		<SiteRenewContainer ref={ ref }>
			<IconContainer>
				{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size*/ }
				<Gridicon icon="notice" size={ 20 } />
			</IconContainer>
			<SiteRenewNotice>
				{ sprintf(
					/* translators: %s - the plan's product name */
					__( '%s - Expired' ),
					site.plan?.product_name_short
				) }
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
			</SiteRenewNotice>
		</SiteRenewContainer>
	);
};
