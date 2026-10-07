import { __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import agencyTierLevelsImage from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-levels.svg';
import { useAnalytics } from '../../app/analytics';
import { Callout } from '../../components/callout';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';

const TRACKS_SECTION = 'a8c-for-agencies-partner-directory';

export default function PartnerDirectoryTierUpsell() {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );

	useEffect( () => {
		recordTracksEvent( 'calypso_agency_tier_permission_error_view', { section: TRACKS_SECTION } );
	}, [ recordTracksEvent ] );

	const callout = (
		<Callout
			image={
				<div style={ { minHeight: '260px' } }>
					<img src={ agencyTierLevelsImage } alt="" />
				</div>
			}
			title={ __( 'Access this benefit when you become an Agency Partner.' ) }
			description={
				<Text variant="muted">
					{ __(
						'Agency Partners and Pro Agency Partners can apply to be included in Automattic’s directory listings.'
					) }
				</Text>
			}
			actions={
				<RouterLinkButton
					to="/tiers"
					variant="primary"
					onClick={ () =>
						recordTracksEvent( 'calypso_agency_tier_permission_error_button_click', {
							section: TRACKS_SECTION,
						} )
					}
				>
					{ __( 'Learn more' ) }
				</RouterLinkButton>
			}
		/>
	);

	return (
		<PageLayout header={ <PageHeader title={ __( 'Partner Directories' ) } /> }>
			{ isDesktop ? (
				<EmptyState.Wrapper>
					<div style={ { maxWidth: '680px' } }>{ callout }</div>
				</EmptyState.Wrapper>
			) : (
				callout
			) }
		</PageLayout>
	);
}
