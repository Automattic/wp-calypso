import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { JetpackWelcomePage } from '../jetpack-welcome-page';

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
		<JetpackWelcomePage
			description={ translate( "Here's how to get started with Jetpack." ) }
			mainClassName="jetpack-free-welcome"
			pageViewTracker={
				<PageViewTracker
					path="/pricing/jetpack-free/welcome"
					title="Pricing > Jetpack Free > Welcome to Jetpack"
				/>
			}
			title={
				<>
					{ translate( 'Welcome{{br/}} to Jetpack!', {
						components: {
							br: <br />,
						},
					} ) }{ ' ' }
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</>
			}
			steps={ [
				{
					title: translate( 'Install Jetpack' ),
					content: (
						<p>
							{ translate(
								'Download Jetpack or install it directly from your site by following the {{a}}instructions we put together here{{/a}}.',
								{
									components: {
										a: (
											<a
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
					),
				},
				{
					title: translate( 'Try our powerful free features' ),
					content: (
						<>
							<ul className="jetpack-free-welcome__features">
								<li>
									{ translate( '{{a}}Speed up your site{{/a}} with our CDN.', {
										components: {
											a: (
												<a
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
						</>
					),
				},
			] }
		/>
	);
};

export default JetpackFreeWelcome;
