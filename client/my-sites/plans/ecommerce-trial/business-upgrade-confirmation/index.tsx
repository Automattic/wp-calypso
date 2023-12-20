import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import i18n, { useTranslate } from 'i18n-calypso';
import { useLayoutEffect } from 'react';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import BusinessTrialIncluded from 'calypso/my-sites/plans/current-plan/trials/business-trial-included';
import { useDispatch, useSelector } from 'calypso/state';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const noop = () => {};

const BusinessUpgradeConfirmation = () => {
	const selectedSite = useSelector( getSelectedSite );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	useLayoutEffect( () => {
		dispatch( hideMasterbar() );

		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'business-trial-upgraded' ] } />
			{ selectedSite && <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> }
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-upgraded/:site"
					title="Plans > Business Trial Post Upgrade Actions"
				/>
				<StepContainer
					stepName="business-trial-upgraded"
					hideBack
					skipLabelText={ translate( 'Skip to dashboard' ) }
					goNext={ () => page.redirect( `/home/${ selectedSite?.slug }` ) }
					recordTracksEvent={ noop }
					stepContent={
						<>
							<div className="trial-upgrade-confirmation__header">
								<h1 className="trial-upgrade-confirmation__title">
									{ isEnglishLocale ||
									i18n.hasTranslation( 'Welcome to the %(businessPlanName)s plan' )
										? translate( 'Welcome to the %(businessPlanName)s plan', {
												args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() || '' },
										  } )
										: translate( 'Welcome to the Business plan' ) }
								</h1>
								<div className="trial-upgrade-confirmation__subtitle">
									<span className="trial-upgrade-confirmation__subtitle-line">
										{ isEnglishLocale ||
										i18n.hasTranslation(
											"Your purchase is complete, and you're now on the {{strong}}%(businessPlanName)s plan{{/strong}}. It's time to take your website to the next level—here are some options."
										)
											? translate(
													"Your purchase is complete, and you're now on the {{strong}}%(businessPlanName)s plan{{/strong}}. It's time to take your website to the next level—here are some options.",
													{
														components: {
															strong: <strong />,
														},
														args: {
															businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() || '',
														},
													}
											  )
											: translate(
													"Your purchase is complete, and you're now on the {{strong}}Business plan{{/strong}}. It's time to take your website to the next level—here are some options.",
													{
														components: {
															strong: <strong />,
														},
													}
											  ) }
									</span>
								</div>
							</div>
							<div className="trial-upgrade-confirmation__tasks">
								<BusinessTrialIncluded
									displayAll={ true }
									displayOnlyActionableItems
									tracksContext="upgrade_confirmation"
								/>
							</div>
						</>
					}
				/>
			</Main>
		</>
	);
};

export default BusinessUpgradeConfirmation;
