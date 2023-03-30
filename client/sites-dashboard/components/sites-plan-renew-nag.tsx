import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { Site } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useInView } from 'calypso/lib/use-in-view';
import { PLAN_RENEW_NAG_EVENT_NAMES } from '../utils';

interface PlanRenewProps {
	plan: Site.SiteDetailsPlan;
	isSiteOwner: boolean;
	checkoutUrl: string;
	hideRenewLink?: boolean;
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

export const PlanRenewNag = ( {
	isSiteOwner,
	plan,
	checkoutUrl,
	hideRenewLink,
}: PlanRenewProps ) => {
	const { __ } = useI18n();
	const trackCallback = useCallback(
		() =>
			recordTracksEvent( PLAN_RENEW_NAG_EVENT_NAMES.IN_VIEW, {
				is_site_owner: isSiteOwner,
				product_slug: plan.product_slug,
				display_mode: 'list',
			} ),
		[ isSiteOwner, plan.product_slug ]
	);
	const ref = useInView< HTMLDivElement >( trackCallback );

	const renewText = __( 'Renew plan' );
	return (
		<PlanRenewContainer ref={ ref }>
			<IconContainer>
				{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size*/ }
				<Gridicon icon="notice" size={ 20 } />
			</IconContainer>
			<PlanRenewNotice>
				<PlanRenewNoticeTextContainer>
					<PlanRenewNoticeExpireText>
						{ sprintf(
							/* translators: %s - the plan's product name */
							__( '%s - Expired' ),
							plan.product_name_short
						) }
					</PlanRenewNoticeExpireText>
				</PlanRenewNoticeTextContainer>
				{ isSiteOwner && ! hideRenewLink && (
					<PlanRenewLink
						onClick={ () => {
							recordTracksEvent( PLAN_RENEW_NAG_EVENT_NAMES.ON_CLICK, {
								product_slug: plan.product_slug,
								display_mode: 'list',
							} );
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
