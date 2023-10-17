import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Notice from 'calypso/components/notice';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { PLAN_RENEW_NAG_EVENT_NAMES } from '../utils';

interface SitesGridActionRenewProps {
	site: SiteExcerptData;
	isUpgradeable: boolean;
}

const Container = styled.div( {
	position: 'absolute',
	top: 0,
	left: 0,
	padding: 6,
	width: '100%',
	boxSizing: 'border-box',
	'.notice__text': {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
} );

const RenewLink = styled.a( {
	textDecoration: 'underline',
	textUnderlineOffset: 4,
	'&:hover': {
		textDecoration: 'none',
	},
} );

export function SitesGridActionRenew( { site, isUpgradeable }: SitesGridActionRenewProps ) {
	const { __ } = useI18n();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isSiteOwner = site.site_owner === userId;
	const productSlug = site.plan?.product_slug;

	const trackCallback = useCallback( () => {
		recordTracksEvent( PLAN_RENEW_NAG_EVENT_NAMES.IN_VIEW, {
			is_site_owner: isSiteOwner,
			product_slug: productSlug,
			display_mode: 'grid',
		} );
	}, [ isSiteOwner, productSlug ] );

	const { ref } = useInView( {
		onChange: ( inView ) => inView && trackCallback(),
	} );

	return (
		<Container>
			<Notice status="is-error" icon="notice" showDismiss={ false }>
				<span ref={ ref }>
					{
						/* translators: %s - the plan's product name, such as Business or Pro. */
						sprintf( __( '%s Plan expired.' ), site.plan?.product_name_short )
					}
				</span>
				{ isSiteOwner && (
					<RenewLink
						href={
							isUpgradeable ? `/plans/${ site.slug }` : `/checkout/${ site.slug }/${ productSlug }`
						}
						onClick={ () => {
							recordTracksEvent( PLAN_RENEW_NAG_EVENT_NAMES.ON_CLICK, {
								product_slug: productSlug,
								display_mode: 'grid',
							} );
						} }
					>
						{ isUpgradeable ? __( 'Upgrade' ) : __( 'Renew' ) }
					</RenewLink>
				) }
			</Notice>
		</Container>
	);
}
