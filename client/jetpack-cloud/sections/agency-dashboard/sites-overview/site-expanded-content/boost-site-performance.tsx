import { Button } from '@automattic/components';
import { Icon, help } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { jetpackBoostDesktopIcon, jetpackBoostMobileIcon } from '../../icons';
import { getBoostRating, getBoostRatingClass } from '../utils';
import ExpandedCard from './expanded-card';
import type { BoostData } from '../types';

interface Props {
	boostData: BoostData;
	hasBoost: boolean;
	siteUrlWithScheme: string;
}

export default function BoostSitePerformance( {
	boostData,
	hasBoost,
	siteUrlWithScheme,
}: Props ) {
	const translate = useTranslate();

	const { overall: overallScore, mobile: mobileScore, desktop: desktopScore } = boostData;

	const components = {
		strong: <strong></strong>,
	};

	const href = `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack-boost`;
	return (
		<ExpandedCard
			header={ translate( 'Boost site performance' ) }
			isEnabled={ !! hasBoost }
			emptyContent={ translate(
				'Add {{strong}}Boost{{/strong}} to see your site performance scores',
				{
					components,
				}
			) }
		>
			<div className="site-expanded-content__card-content-container">
				<div className="site-expanded-content__card-content">
					<div className="site-expanded-content__card-content-column">
						<div
							className={ classNames(
								'site-expanded-content__card-content-score',
								getBoostRatingClass( overallScore )
							) }
						>
							{ getBoostRating( overallScore ) }
							<Icon size={ 20 } className="site-expanded-content__help-icon" icon={ help } />
						</div>
						<div className="site-expanded-content__card-content-score-title">
							{ translate( 'Overall' ) }
						</div>
					</div>
					<div className="site-expanded-content__card-content-column">
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
					</div>
				</div>
				<div className="site-expanded-content__card-footer">
					<Button
						href={ href }
						target="_blank"
						className="site-expanded-content__card-button"
						compact
					>
						{ translate( 'Optimize CSS' ) }
					</Button>
				</div>
			</div>
		</ExpandedCard>
	);
}
