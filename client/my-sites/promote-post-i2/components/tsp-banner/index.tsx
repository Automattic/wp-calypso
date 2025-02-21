import { ExternalLink, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TspBannerImage from './tsp-banner-image';
import './style.scss';

type TspBannerProps = {
	onToggle: () => void;
	isCollapsed: boolean;
};

function TspBanner( props: TspBannerProps ) {
	const translate = useTranslate();

	const onBannerToggle = () => {
		props.onToggle();
	};

	const isCollapsed = props.isCollapsed;

	return (
		<div className="tsp-banner__container">
			<div className="tsp-banner__content">
				<button className="tsp-banner__close" onClick={ onBannerToggle }>
					<Gridicon icon={ isCollapsed ? 'chevron-down' : 'chevron-up' } size={ 16 } />
				</button>
				{ ! isCollapsed && (
					<>
						<section className="tsp-banner__text">
							<div className="tsp-banner__header wp-brand-font">
								{ translate( 'More engagement at no cost' ) }
							</div>
							<div className="tsp-banner__description">
								{ translate(
									'Reach more people and spark conversations by promoting your content as a native Tumblr post, where users can like, reply, and engage directly with your ad.'
								) }
								&nbsp;
								<ExternalLink
									href={ localizeUrl(
										'https://wordpress.com/support/promote-a-post/promote-your-content-with-tumblr-native-posts'
									) }
									target="_blank"
									onClick={ () => {
										recordTracksEvent( 'calypso_dsp_tsp_banner_learn_more_click', {} );
									} }
								>
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
					</>
				) }
				{ isCollapsed && (
					<>
						<section className="tsp-banner__text-collapsed">
							<div className="tsp-banner__description">
								{ translate(
									'Reach more people and spark conversations by promoting your content as a native Tumblr post.'
								) }
								{ /* TODO: Start using "Try now" link after reaching this feature's MVP */ }
								{ /* &nbsp;
								<ExternalLink href="#" target="_blank">
									{ translate( 'Try now' ) }
								  	<Gridicon icon="external" size={ 16 } />
								</ExternalLink> */ }
							</div>
						</section>
					</>
				) }
			</div>
		</div>
	);
}

export default TspBanner;
