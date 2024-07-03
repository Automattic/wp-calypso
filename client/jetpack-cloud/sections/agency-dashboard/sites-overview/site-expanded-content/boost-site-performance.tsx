import { Button, Gridicon, Tooltip } from '@automattic/components';
import { Icon, help } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useMemo } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useSelector } from 'calypso/state';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { jetpackBoostDesktopIcon, jetpackBoostMobileIcon } from '../../icons';
import { getBoostRating, getBoostRatingClass } from '../lib/boost';
import BoostLicenseInfoModal from '../site-status-content/site-boost-column/boost-license-info-modal';
import ExpandedCard from './expanded-card';
import InProgressIcon from './in-progress-icon';
import type { Site } from '../types';

interface Props {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError: boolean;
}

export default function BoostSitePerformance( { site, trackEvent, hasError }: Props ) {
	const translate = useTranslate();

	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );
	const isA4AEnabled = isA8CForAgencies();

	const helpIconRef = useRef< HTMLElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );
	const [ boostModalState, setBoostModalState ] = useState< {
		show: boolean;
		upgradeOnly?: boolean;
	} >( { show: false } );

	const {
		blog_id: siteId,
		url_with_scheme: siteUrlWithScheme,
		is_atomic: isAtomicSite,
		has_boost: hasBoost,
		jetpack_boost_scores: boostData,
		has_pending_boost_one_time_score: hasPendingScore,
	} = site;

	const { overall: overallScore, mobile: mobileScore, desktop: desktopScore } = boostData ?? {};

	const components = {
		strong: <strong></strong>,
	};

	const tooltip = translate(
		'Your Overall Score is a summary of your website performance across both mobile and desktop devices.'
	);

	const isBoostEnabled = hasBoost || Boolean( overallScore ) || hasPendingScore;

	const showBoostModal = ( upgradeOnly: boolean ) => {
		setBoostModalState( { show: true, upgradeOnly } );
	};

	const ScoreRating = getBoostRating( overallScore );

	const ctaButtons = useMemo( () => {
		if ( ! hasBoost ) {
			const jetpackDashboardPage = isAtomicSite ? 'jetpack' : 'my-jetpack';

			return [
				{
					label: translate( 'Upgrade to auto-optimize' ),
					onClick: () => {
						trackEvent( 'boost_expandable_block_auto_optimize_click' );
						showBoostModal( true );
					},
					primary: true,
				},
				{
					label: translate( 'Settings' ),
					href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=${ jetpackDashboardPage }`,
					onClick: () => trackEvent( 'boost_expandable_block_settings_click' ),
				},
			];
		}

		if ( ScoreRating === 'A' ) {
			return [
				{
					label: translate( 'Boost Settings' ),
					href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack-boost`,
					onClick: () => trackEvent( 'boost_expandable_block_boost_settings_click' ),
				},
			];
		}

		return [
			{
				label: translate( 'Optimize performance' ),
				href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack-boost`,
				onClick: () => trackEvent( 'boost_expandable_block_optimize_performance_click' ),
				primary: true,
			},
		];
	}, [ isAtomicSite, hasBoost, ScoreRating, translate, siteUrlWithScheme, trackEvent ] );

	if ( ! isA4AEnabled && ! isBoostEnabled && ! partnerCanIssueLicense ) {
		return null;
	}

	return (
		<>
			<ExpandedCard
				header={ translate( 'Boost site performance' ) }
				isEnabled={ isBoostEnabled }
				emptyContent={ translate(
					'{{strong}}Get Score{{/strong}} to see your site performance scores',
					{
						components,
					}
				) }
				hasError={ hasError }
				// Allow to click on the card only if Boost is not active
				onClick={ () => {
					if ( ! isBoostEnabled ) {
						trackEvent( 'boost_expandable_block_get_score_click' );
						showBoostModal( false );
					}
				} }
			>
				<div className="site-expanded-content__card-content-container">
					<div className="site-expanded-content__card-content">
						<div className="site-expanded-content__card-content-column">
							{ hasPendingScore ? (
								<InProgressIcon />
							) : (
								<div
									className={ clsx(
										'site-expanded-content__card-content-score',
										getBoostRatingClass( overallScore )
									) }
								>
									{ ScoreRating }

									<span
										ref={ helpIconRef }
										onMouseEnter={ () => setShowTooltip( true ) }
										onMouseLeave={ () => setShowTooltip( false ) }
									>
										<Icon size={ 20 } className="site-expanded-content__help-icon" icon={ help } />
									</span>
									<Tooltip
										id={ `${ siteId }-boost-help-text` }
										context={ helpIconRef.current }
										isVisible={ showTooltip }
										position="bottom"
										className="site-expanded-content__tooltip"
									>
										{ tooltip }
									</Tooltip>
								</div>
							) }
							<div className="site-expanded-content__card-content-score-title">
								{ translate( 'Overall' ) }
							</div>
						</div>
						<div className="site-expanded-content__card-content-column">
							{ hasPendingScore ? (
								<InProgressIcon />
							) : (
								<div className="site-expanded-content__device-score-container">
									<div className="site-expanded-content__card-content-column">
										<Icon
											size={ 24 }
											className="site-expanded-content__device-icon"
											icon={ jetpackBoostDesktopIcon }
										/>
										<span className="site-expanded-content__device-score">{ desktopScore }</span>
									</div>
									<div className="site-expanded-content__card-content-column site-expanded-content__card-content-column-mobile">
										<Icon
											className="site-expanded-content__device-icon"
											size={ 24 }
											icon={ jetpackBoostMobileIcon }
										/>
										<span className="site-expanded-content__device-score">{ mobileScore }</span>
									</div>
								</div>
							) }
							<div className="site-expanded-content__card-content-score-title">
								{ translate( 'Devices' ) }
							</div>
						</div>
					</div>
					<div className="site-expanded-content__card-footer">
						{ ctaButtons.map( ( ctaButton ) => (
							<Button
								key={ ctaButton.label }
								href={ ctaButton.href }
								target="_blank"
								onClick={ ctaButton.onClick }
								className="site-expanded-content__card-button"
								primary={ ctaButton.primary }
								compact
							>
								{ ctaButton.label } { !! ctaButton.href && <Gridicon icon="external" /> }
							</Button>
						) ) }
					</div>
				</div>
			</ExpandedCard>

			{ boostModalState.show && (
				<BoostLicenseInfoModal
					onClose={ () => setBoostModalState( { show: false } ) }
					site={ site }
					upgradeOnly={ boostModalState.upgradeOnly }
				/>
			) }
		</>
	);
}
