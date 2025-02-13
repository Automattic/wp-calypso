import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import TspBannerImage from './tsp-banner-image';

import './style.scss';

type TspBannerProps = {
	onClose: () => void;
	display: boolean;
};

function TspBanner( props: TspBannerProps ) {
	const translate = useTranslate();

	const onBannerClose = () => {
		props.onClose();
	};

	if ( props.display ) {
		return (
			<div className="tsp-banner__container">
				<div className="tsp-banner__content">
					<button className="tsp-banner__close" onClick={ onBannerClose }>
						<Gridicon icon="cross" size={ 16 } />
					</button>
					<section className="tsp-banner__text">
						<div className="tsp-banner__header wp-brand-font">
							{ translate( 'More engagement at no cost' ) }
						</div>
						<div className="tsp-banner__description">
							{ translate(
								'Reach more people and spark conversations by promoting your content as a native Tumblr post, where users can like, reply, and engage directly with your ad.'
							) }
							&nbsp;
							<ExternalLink href="#" target="_blank">
								{ translate( 'Learn more' ) }
								<Gridicon icon="external" size={ 16 } />
							</ExternalLink>
						</div>
						{ /* TODO: Start using "Try now" link after reaching this feature's MVP */ }
						{ /* <div className="tsp-banner__link">
							<ExternalLink href="#" target="_blank">
								{ translate( 'Try now' ) }
								<Gridicon icon="external" size={ 16 } />
							</ExternalLink>
						</div> */ }
					</section>
					<section className="tsp-banner__image">
						<TspBannerImage />
					</section>
				</div>
			</div>
		);
	}

	return <></>;
}

export default TspBanner;
