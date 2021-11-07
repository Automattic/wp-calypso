import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const JetpackFreeWelcome: FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const jetpackInstallInstructionsLink =
		'https://jetpack.com/support/getting-started-with-jetpack/';
	const featureLink1 = 'https://jetpack.com/features/design/content-delivery-network/';
	const featureLink2 = 'https://jetpack.com/features/security/downtime-monitoring/';
	const featureLink3 = 'https://jetpack.com/features/growth/automatic-publishing/';
	const featuresComparisonLink = 'https://jetpack.com/features/comparison/';

	return (
		<Main wideLayout className="jetpack-free-welcome">
			<PageViewTracker
				path="/pricing/jetpack-free/welcome"
				title="Pricing > Jetpack Free > Welcome to Jetpack"
			/>
			<Card className="jetpack-free-welcome__card">
				<div className="jetpack-free-welcome__card-main">
					<JetpackLogo size={ 45 } />
					<h1 className="jetpack-free-welcome__main-message">
						{ translate( 'Welcome{{br/}} to Jetpack!', {
							components: {
								br: <br />,
							},
						} ) }{ ' ' }
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</h1>
					<p>{ translate( "Here's how to get started with Jetpack." ) }</p>
					<div className="jetpack-free-welcome__step">
						<div className="jetpack-free-welcome__step-number">1</div>
						<div className="jetpack-free-welcome__step-content">
							<h2>{ translate( 'Install Jetpack' ) }</h2>
							<p>
								{ translate(
									'Download Jetpack or install it directly from your site by following the {{a}}instructions we put together here{{/a}}.',
									{
										components: {
											a: (
												<a
													className="jetpack-free-welcome__link"
													target="_blank"
													rel="noopener noreferrer"
													onClick={ () =>
														dispatch(
															recordTracksEvent(
																'calypso_siteless_free_page_install_instructions_link_clicked',
																{
																	product_slug: 'jetpack_free',
																}
															)
														)
													}
													href={ jetpackInstallInstructionsLink }
												/>
											),
										},
									}
								) }
							</p>
						</div>
					</div>
					<div className="jetpack-free-welcome__step">
						<div className="jetpack-free-welcome__step-number">2</div>
						<div className="jetpack-free-welcome__step-content">
							<h2>{ translate( 'Try our powerful free features' ) }</h2>
							<ul className="jetpack-free-welcome__features">
								<li>
									{ translate( '{{a}}Speed up your site{{/a}} with our CDN.', {
										components: {
											a: (
												<a
													className="jetpack-free-welcome__feature-link"
													target="_blank"
													rel="noopener noreferrer"
													onClick={ () =>
														dispatch( recordTracksEvent( 'jetpack_free_welcome_cdn_link_clicked' ) )
													}
													href={ featureLink1 }
												/>
											),
										},
									} ) }
								</li>
								<li>
									{ translate(
										'{{a}}Make sure your site is online{{/a}} with our Downtime Monitor.',
										{
											components: {
												a: (
													<a
														className="jetpack-free-welcome__feature-link"
														target="_blank"
														rel="noopener noreferrer"
														onClick={ () =>
															dispatch(
																recordTracksEvent(
																	'jetpack_free_welcome_downtime_monitor_link_clicked'
																)
															)
														}
														href={ featureLink2 }
													/>
												),
											},
										}
									) }
								</li>
								<li>
									{ translate( '{{a}}Grow your brand{{/a}} with our Social Media Tools.', {
										components: {
											a: (
												<a
													className="jetpack-free-welcome__feature-link"
													target="_blank"
													rel="noopener noreferrer"
													onClick={ () =>
														dispatch(
															recordTracksEvent(
																'jetpack_free_welcome_social_media_tools_link_clicked'
															)
														)
													}
													href={ featureLink3 }
												/>
											),
										},
									} ) }
								</li>
							</ul>
							<a
								className="jetpack-free-welcome__feature-nav-button"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ () =>
									dispatch(
										recordTracksEvent( 'jetpack_free_welcome_learn_products_link_clicked' )
									)
								}
								href={ featuresComparisonLink }
							>
								<span>{ translate( 'Want to learn more about our products?' ) }</span>
								<span>{ translate( 'See how Jetpack can help grow your business or hobby' ) }</span>
							</a>
						</div>
					</div>
				</div>
			</Card>
		</Main>
	);
};

export default JetpackFreeWelcome;
