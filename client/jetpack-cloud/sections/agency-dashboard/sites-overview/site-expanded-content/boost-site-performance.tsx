import { Button } from '@automattic/components';
import { Icon, help } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { getBoostRating, getBoostRatingClass } from '../utils';
import ExpandedCard from './expanded-card';
import type { BoostData } from '../types';

interface Props {
	boostData: BoostData;
	hasBoost: boolean;
}

export default function BoostSitePerformance( { boostData, hasBoost }: Props ) {
	const translate = useTranslate();

	const { overall: overallScore, mobile: mobileScore, desktop: desktopScore } = boostData;

	const components = {
		strong: <strong></strong>,
	};

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
							<Icon size={ 24 } className="site-expanded-content__help-icon" icon={ help } />
						</div>
						<div className="site-expanded-content__card-content-score-title">
							{ translate( 'Overall' ) }
						</div>
					</div>
					<div className="site-expanded-content__card-content-column">
						<div className="site-expanded-content__device-score-container">
							<div className="site-expanded-content__card-content-column">
								<Icon
									size={ 26 }
									className="site-expanded-content__device-icon"
									icon={
										<svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M3.91113 6.5C3.91113 5.67157 4.58271 5 5.41113 5H14.0778C14.9062 5 15.5778 5.67157 15.5778 6.5V12.5H16.1195C16.7408 12.5 17.2445 13.0037 17.2445 13.625H2.24451C2.24451 13.0037 2.74819 12.5 3.36951 12.5H3.91113V6.5ZM5.41113 6.125H14.0778C14.2849 6.125 14.4528 6.29289 14.4528 6.5V12.2083H5.03613V6.5C5.03613 6.29289 5.20403 6.125 5.41113 6.125Z"
												fill="#646970"
											/>
										</svg>
									}
								/>
								<span className="site-expanded-content__device-score">{ desktopScore }</span>
							</div>
							<div className="site-expanded-content__card-content-column site-expanded-content__card-content-column-mobile">
								<Icon
									className="site-expanded-content__device-icon"
									size={ 26 }
									icon={
										<svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M10.4945 12.5H8.99451V13.625H10.4945V12.5Z" fill="#646970" />
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M5.99451 5C5.99451 4.17157 6.66608 3.5 7.49451 3.5H11.9945C12.8229 3.5 13.4945 4.17157 13.4945 5V14C13.4945 14.8284 12.8229 15.5 11.9945 15.5H7.49451C6.66608 15.5 5.99451 14.8284 5.99451 14V5ZM7.49451 4.625H11.9945C12.2016 4.625 12.3695 4.79289 12.3695 5V14C12.3695 14.2071 12.2016 14.375 11.9945 14.375H7.49451C7.2874 14.375 7.11951 14.2071 7.11951 14V5C7.11951 4.79289 7.2874 4.625 7.49451 4.625Z"
												fill="#646970"
											/>
										</svg>
									}
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
					<Button className="site-expanded-content__card-button" compact>
						{ translate( 'Optimize CSS' ) }
					</Button>
				</div>
			</div>
		</ExpandedCard>
	);
}
