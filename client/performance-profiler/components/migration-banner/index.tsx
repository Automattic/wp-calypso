import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import MigrationBannerImg from 'calypso/assets/images/performance-profiler/migration-banner-img.png';
import { LogoBar } from '../logo-bar';

import './style.scss';

export const MigrationBanner = ( props: { url: string } ) => {
	const translate = useTranslate();

	return (
		<div className="performance-profiler-migration-banner">
			<div className="l-block-wrapper">
				<div className="content-area">
					<div className="content">
						<div className="content-text">
							<div className="section-name">{ translate( 'WordPress.com Hosting' ) }</div>
							<div className="title">
								{ translate( 'Scale without Limits, Perform without Compromise' ) }
							</div>
							<div className="subtitle">
								{ translate(
									'Managed WordPress hosting designed for scalable, lightning-fast speed anywhere in the world, whatever you throw at it.'
								) }
							</div>
							<div className="subtitle">
								{ translate(
									'Get {{span}}50% off our Business plan{{/span}} for an entire year when you migrate your site.',
									{ components: { span: <span className="highlight" /> } }
								) }
							</div>
						</div>
						<div className="features">
							<div className="feature">
								<Gridicon className="icon" icon="checkmark" size={ 12 } />
								{ translate( 'Unlimited bandwidth, visitors, and traffic' ) }
							</div>
							<div className="feature">
								<Gridicon className="icon" icon="checkmark" size={ 12 } />
								{ translate( '14-day money-back guarantee' ) }
							</div>
							<div className="feature">
								<Gridicon className="icon" icon="checkmark" size={ 12 } />
								{ translate( 'Free migrations' ) }
							</div>
						</div>
						<div className="buttons">
							<Button
								variant="primary"
								href={ `https://wordpress.com/setup/hosted-site-migration?from=${ props.url }&ref=performance-profiler-dashboard` }
							>
								{ translate( 'Migrate your site' ) }
							</Button>

							<Button
								variant="secondary"
								className="outlined-button"
								href="https://wordpress.com/hosting/"
							>
								{ translate( 'Learn More' ) }
							</Button>
						</div>
					</div>
					<div className="illustration">
						<img
							src={ MigrationBannerImg }
							width={ 514 }
							alt={ translate(
								'Image showing WordPress.com connecting sections of the web world'
							) }
						/>
					</div>
				</div>
				<p className="trusted-by">{ translate( 'Trusted by 160 million worldwide' ) }</p>
			</div>

			<LogoBar />
		</div>
	);
};
