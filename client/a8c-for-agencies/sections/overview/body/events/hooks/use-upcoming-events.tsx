import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useMemo } from 'react';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowPressablePromoOffer =
		agency?.billing_system === 'billingdragon' && pressableOwnership !== 'agency';

	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const onSeeMigrationIncentivesTrackingGuideClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent(
					'calypso_a4a_overview_events_a4a_pressable_promo_offer_2026_01_29_see_migration_incentives_tracking_guide_click'
				)
			);
			showSupportGuide(
				'https://agencieshelp.automattic.com/knowledge-base/migration-incentive-tracking/'
			);
		},
		[ dispatch, showSupportGuide ]
	);

	const onSeeFullTermClick = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_overview_events_a4a_pressable_promo_offer_2026_01_29_see_full_terms_click'
			)
		);
	}, [ dispatch ] );

	const onSeeMigrationBonusTermsClick = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_overview_events_a4a_pressable_promo_offer_2026_01_29_see_migration_bonus_terms_click'
			)
		);
	}, [ dispatch ] );

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			...( shouldShowPressablePromoOffer
				? [
						{
							id: 'a4a-pressable-promo-offer-2026-01-29',
							date: {
								from: moment( '2026-02-12' ),
								to: moment( '2026-04-30' ),
							},
							displayDate: ' ', // Empty string to hide the date
							title: translate(
								'Your Exclusive Automattic for Agencies Limited-Time Pressable Offer Just{{nbsp/}}Got{{nbsp/}}Better 🎉',
								{
									components: {
										nbsp: <>&nbsp;</>,
									},
								}
							),
							subtitle: translate( 'Automattic for Agencies & Pressable' ),
							descriptions: [
								translate(
									'Enjoy up to 6 months free on Pressable Signature and Premium Plans with Automattic for Agencies. Choose annual billing for 6 months free or monthly billing for 3 months free, while still earning revenue share and reseller incentives.'
								),

								translate(
									'PLUS earn up to $200 for each Signature site and up to $1,000 for each Premium site successfully migrated and {{a}}tagged{{/a}} by the deadline.',
									{
										components: {
											a: (
												<Button
													variant="link"
													onClick={ onSeeMigrationIncentivesTrackingGuideClick }
												/>
											),
										},
									}
								),
							],
							ctas: [
								{
									variant: 'primary',
									label: translate( 'View promo details' ),
									url: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
									trackEventName:
										'calypso_a4a_overview_events_a4a_pressable_promo_offer_2026_01_29_view_click',
								},
							],
							extraContent: (
								<>
									{ translate(
										'See terms of Hosting Promotion {{TermLink}}here{{/TermLink}} and the Migration Bonus {{MigrationBonusLink}}here{{/MigrationBonusLink}}',
										{
											components: {
												TermLink: (
													<Button
														variant="link"
														onClick={ onSeeFullTermClick }
														href="https://pressable.com/legal/hosting-promotion-terms/"
														target="_blank"
													/>
												),
												MigrationBonusLink: (
													<Button
														variant="link"
														onClick={ onSeeMigrationBonusTermsClick }
														href="https://pressable.com/legal/migration-bonus-2026/"
														target="_blank"
													/>
												),
											},
										}
									) }
								</>
							),
							logoUrl: PressableLogo,
							dateClassName: 'a4a-event__date--pressable',
						},
				  ]
				: [] ),
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [
		localizedMoment,
		onSeeFullTermClick,
		onSeeMigrationBonusTermsClick,
		onSeeMigrationIncentivesTrackingGuideClick,
		shouldShowPressablePromoOffer,
		translate,
	] );
};
