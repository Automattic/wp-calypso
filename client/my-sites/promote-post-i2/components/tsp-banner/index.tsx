import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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

	const isSelfHosted = useSelector( ( state ) =>
		isJetpackSite( state, getSelectedSiteId( state ), { treatAtomicAsJetpackSite: false } )
	);

	const isCollapsed = props.isCollapsed;

	return (
		<div className="tsp-banner__container">
			<div className="tsp-banner__content">
				<button
					className="tsp-banner__close"
					onClick={ onBannerToggle }
					aria-label={
						isCollapsed ? translate( 'Expand section' ) : translate( 'Collapse section' )
					}
					aria-expanded={ ! isCollapsed }
					aria-controls="promotional-banner"
				>
					<Gridicon icon={ isCollapsed ? 'chevron-down' : 'chevron-up' } size={ 16 } />
				</button>
				{ ! isCollapsed && (
					<>
						<section className="tsp-banner__text" id="promotional-banner">
							<div className="tsp-banner__header wp-brand-font">
								{ translate( 'More engagement at no cost' ) }
							</div>
							<div className="tsp-banner__description">
								{ translate(
									'Reach more people and spark conversations by promoting your content as a native Tumblr post, where users can like, reply, and engage directly with your ad.'
								) }
								&nbsp;
								<InlineSupportLink
									supportContext="blaze_learn_more"
									showIcon={ false }
									onClick={ () => {
										recordTracksEvent( 'calypso_dsp_tsp_banner_learn_more_click', {} );
									} }
									showSupportModal={ ! isSelfHosted }
								>
									{ translate( 'Learn more' ) }
								</InlineSupportLink>
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
