import { Button } from '@automattic/components';
import { Icon, help } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useMemo } from 'react';
import Tooltip from 'calypso/components/tooltip';
import { jetpackBoostDesktopIcon, jetpackBoostMobileIcon } from '../../icons';
import { getBoostRating, getBoostRatingClass } from '../lib/boost';
import BoostLicenseInfoModal from '../site-status-content/site-boost-column/boost-license-info-modal';
import ExpandedCard from './expanded-card';
import InProgressIcon from './in-progress-icon';
import type { BoostData } from '../types';

interface Props {
	boostData: BoostData;
	hasBoost: boolean;
	siteId: number;
	siteUrlWithScheme: string;
	trackEvent: ( eventName: string ) => void;
	hasError: boolean;
	hasPendingScore: boolean;
}

export default function BoostSitePerformance( {
	boostData,
	hasBoost,
	siteId,
	siteUrlWithScheme,
	trackEvent,
	hasError,
	hasPendingScore,
}: Props ) {
	const translate = useTranslate();

	const helpIconRef = useRef< HTMLElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );
	const [ showBoostModal, setShowBoostModal ] = useState( false );

	const { overall: overallScore, mobile: mobileScore, desktop: desktopScore } = boostData;

	const components = {
		strong: <strong></strong>,
	};

	const tooltip = translate(
		'Your Overall Score is a summary of your website performance across both mobile and desktop devices.'
	);

	const isEnabled = !! ( hasBoost || overallScore );

	const buttonProps = useMemo(
		() =>
			hasBoost && overallScore
				? {
						label: translate( 'Optimize CSS' ),
						href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack-boost`,
						onClick: () => trackEvent( 'expandable_block_optimize_css_click' ),
				  }
				: {
						label: translate( 'Configure Boost' ),
						href: `${ siteUrlWithScheme }/wp-admin/admin.php?page=my-jetpack#/add-boost`,
						onClick: () => trackEvent( 'expandable_block_configure_boost_click' ),
				  },
		[ hasBoost, siteUrlWithScheme, trackEvent, translate, overallScore ]
	);

	const handleOnClick = () => {
		setShowBoostModal( true );
	};

	return (
		<ExpandedCard
			header={ translate( 'Boost site performance' ) }
			isEnabled={ isEnabled }
			emptyContent={ translate(
				'{{strong}}Get Score{{/strong}} to see your site performance scores',
				{
					components,
				}
			) }
			hasError={ hasError }
			// Allow to click on the card only if Boost is not active
			onClick={ ! isEnabled ? handleOnClick : undefined }
		>
			<div className="site-expanded-content__card-content-container">
				<div className="site-expanded-content__card-content">
					<div className="site-expanded-content__card-content-column">
						{ hasPendingScore ? (
							<InProgressIcon />
						) : (
							<div
								className={ classNames(
									'site-expanded-content__card-content-score',
									getBoostRatingClass( overallScore )
								) }
							>
								{ getBoostRating( overallScore ) }

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
							<>
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
								<div className="site-expanded-content__card-content-score-title">
									{ translate( 'Devices' ) }
								</div>
							</>
						) }
					</div>
				</div>
				<div className="site-expanded-content__card-footer">
					<Button
						href={ buttonProps.href }
						target="_blank"
						onClick={ buttonProps.onClick }
						className="site-expanded-content__card-button"
						compact
					>
						{ buttonProps.label }
					</Button>
				</div>
			</div>
			{ showBoostModal && (
				<BoostLicenseInfoModal onClose={ () => setShowBoostModal( false ) } siteId={ siteId } />
			) }
		</ExpandedCard>
	);
}
