import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { SiteDetailsPlan } from '@automattic/launch/src/stores';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
const PLAN_RENEW_NAG_IN_VIEW = 'calypso_sites_dashboard_plan_renew_nag_inview';
const PLAN_RENEW_NAG_ON_CLICK = 'calypso_sites_dashboard_plan_renew_nag_click';

interface PlanRenewProps {
	plan: SiteDetailsPlan;
	checkoutUrl: string;
}

const PlanRenewContainer = styled.div( {
	display: 'flex',
	justifyItems: 'flex-start',
	gap: '4px',
	marginTop: '-2px',
} );

const PlanRenewLink = styled.a( {
	whiteSpace: 'nowrap',
	textDecoration: 'underline',
	fontSize: '12px',
	paddingTop: '2px',
} );

const IconContainer = styled.div( {
	color: '#ea303f',
} );

const PlanRenewNotice = styled.div( {
	minWidth: 0,
	display: 'flex',
	flexDirection: 'column',
	color: '#ea303f',
} );

const PlanRenewNoticeTextContainer = styled.div( {
	display: 'flex',
} );

const PlanRenewNoticeExpireText = styled.div( {
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
} );

export const PlanRenewNag = ( { plan, checkoutUrl }: PlanRenewProps ) => {
	const { __ } = useI18n();
	const { ref, inView: inViewOnce } = useInView( { triggerOnce: true } );

	const isSiteOwner = plan.user_is_owner;

	useEffect( () => {
		if ( inViewOnce ) {
			recordTracksEvent( PLAN_RENEW_NAG_IN_VIEW, { is_site_owner: isSiteOwner } );
		}
	}, [ inViewOnce, isSiteOwner ] );

	const renewText = __( 'Renew plan' );
	return (
		<PlanRenewContainer ref={ ref }>
			<IconContainer>
				{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size*/ }
				<Gridicon icon="notice" size={ 20 } />
			</IconContainer>
			<PlanRenewNotice>
				<PlanRenewNoticeTextContainer>
					{ createInterpolateElement(
						sprintf(
							/* translators: %s - the plan's product name */
							__( '%s <span>- Expired</span>' ),
							plan.product_name_short
						),
						{
							span: <PlanRenewNoticeExpireText />,
						}
					) }
				</PlanRenewNoticeTextContainer>
				{ isSiteOwner && (
					<PlanRenewLink
						onClick={ () => {
							recordTracksEvent( PLAN_RENEW_NAG_ON_CLICK );
						} }
						href={ checkoutUrl }
						title={ renewText }
					>
						{ renewText }
					</PlanRenewLink>
				) }
			</PlanRenewNotice>
		</PlanRenewContainer>
	);
};
