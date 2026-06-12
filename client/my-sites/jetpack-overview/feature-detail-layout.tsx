import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getFeatureById, getPlanKey, getPlanTier } from './feature-data';

import './style.scss';

export interface Benefit {
	icon: string;
	title: string;
	body: string;
}

interface FeatureDetailLayoutProps {
	featureId: string;
	icon: string;
	title: string;
	subtitle: string;
	benefits: Benefit[];
	planCallout: string;
	ctaLabel?: string;
	ctaPath?: string;
	backPath: string;
}

export default function FeatureDetailLayout( {
	featureId,
	icon,
	title,
	subtitle,
	benefits,
	planCallout,
	ctaLabel,
	ctaPath,
	backPath,
}: FeatureDetailLayoutProps ) {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );
	const planSlug = currentPlan?.productSlug ?? 'free_plan';

	const featureData = getFeatureById( featureId );
	const availability = featureData?.plans[ planKey ] ?? 'full';
	const isGated = availability === 'none';
	const isLimited = availability === 'limited';
	const upgradePath = `/upgrade-jetpack/${ siteSlug }`;

	useEffect( () => {
		recordTracksEvent( 'calypso_jetpack_feature_page_viewed', {
			feature_id: featureId,
			availability,
			plan_slug: planSlug,
			site_id: site?.ID,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ featureId ] );

	function handleCtaClick() {
		recordTracksEvent( 'calypso_jetpack_feature_page_cta_clicked', {
			feature_id: featureId,
			action: 'view',
			plan_slug: planSlug,
			site_id: site?.ID,
		} );
		page( ctaPath! );
	}

	function handleUpgradeClick() {
		recordTracksEvent( 'calypso_jetpack_feature_page_cta_clicked', {
			feature_id: featureId,
			action: 'upgrade',
			plan_slug: planSlug,
			site_id: site?.ID,
		} );
		page( upgradePath );
	}

	const showViewCta = ctaPath && ctaLabel && ! isGated;
	const showUpgradeCta = isGated || isLimited;

	return (
		<div className="jetpack-overview jetpack-feature-page">
			<QuerySitePlans siteId={ site?.ID } />

			<Button borderless className="jetpack-overview__back" onClick={ () => page( backPath ) }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Jetpack features' ) }
			</Button>

			<div className="jetpack-feature-page__hero">
				<div className="jetpack-feature-page__hero-icon">
					<Gridicon icon={ icon } size={ 36 } />
				</div>
				<div className="jetpack-feature-page__hero-text">
					<h1 className="jetpack-feature-page__title">{ title }</h1>
					<p className="jetpack-feature-page__subtitle">{ subtitle }</p>
				</div>
			</div>

			<div className="jetpack-feature-page__benefits">
				{ benefits.map( ( benefit ) => (
					<div key={ benefit.title } className="jetpack-feature-page__benefit">
						<div className="jetpack-feature-page__benefit-icon">
							<Gridicon icon={ benefit.icon } size={ 24 } />
						</div>
						<h2 className="jetpack-feature-page__benefit-title">{ benefit.title }</h2>
						<p className="jetpack-feature-page__benefit-body">{ benefit.body }</p>
					</div>
				) ) }
			</div>

			<div className="jetpack-feature-page__plan-callout">
				<Gridicon icon="info-outline" size={ 16 } />
				<span>{ planCallout }</span>
			</div>

			{ ( showViewCta || showUpgradeCta ) && (
				<div className="jetpack-feature-page__cta">
					{ showViewCta && (
						<Button primary={ ! isLimited } onClick={ handleCtaClick }>
							{ ctaLabel }
						</Button>
					) }
					{ showUpgradeCta && (
						<Button primary={ isGated || ! showViewCta } onClick={ handleUpgradeClick }>
							{ translate( 'Upgrade your plan' ) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
}
