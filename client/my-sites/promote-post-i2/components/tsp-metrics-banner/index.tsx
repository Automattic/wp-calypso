import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import TspMetricsBannerImage from './tsp-metrics-banner-image';
import './style.scss';

type TspMetricsBannerProps = {
	onClose: () => void;
	display: boolean;
};

function TspMetricsBanner( props: TspMetricsBannerProps ) {
	const translate = useTranslate();
	const onBannerClose = () => {
		props.onClose();
	};
	if ( props.display ) {
		return (
			<div className="tsp-metrics-info-banner__container">
				<button className="tsp-metrics-info-banner__close" onClick={ onBannerClose }>
					<Gridicon icon="cross" size={ 18 } />
				</button>
				<div>
					<span className="tsp-metrics-info-banner__title">
						{ translate( 'New metrics available' ) }
					</span>
					<span className="tsp-metrics-info-banner__text">
						{ translate(
							'Social engagement metrics allow you to see how many Tumblr users saw and interacted with your ad.'
						) }
					</span>
				</div>
				<div className="tsp-metrics-info-banner__image">
					<TspMetricsBannerImage />
				</div>
			</div>
		);
	}
	return <></>;
}

export default TspMetricsBanner;
