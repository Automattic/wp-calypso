import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const Step2 = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const featureLink1 = 'https://jetpack.com/features/design/content-delivery-network/';
	const featureLink2 = 'https://jetpack.com/features/security/downtime-monitoring/';
	const featureLink3 = 'https://jetpack.com/features/growth/automatic-publishing/';
	const featuresComparisonLink = 'https://jetpack.com/features/comparison/';

	return (
		<>
			<h2>{ translate( 'Try our powerful free features' ) }</h2>

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
					{ translate( '{{a}}Make sure your site is online{{/a}} with our Downtime Monitor.', {
						components: {
							a: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									onClick={ () =>
										dispatch(
											recordTracksEvent( 'jetpack_free_welcome_downtime_monitor_link_clicked' )
										)
									}
									href={ featureLink2 }
								/>
							),
						},
					} ) }
				</li>
				<li>
					{ translate( '{{a}}Grow your brand{{/a}} with Jetpack Social.', {
						components: {
							a: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									onClick={ () =>
										dispatch(
											recordTracksEvent( 'jetpack_free_welcome_social_media_tools_link_clicked' )
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
					dispatch( recordTracksEvent( 'jetpack_free_welcome_learn_products_link_clicked' ) )
				}
				href={ featuresComparisonLink }
			>
				<span>{ translate( 'Want to learn more about our products?' ) }</span>
				<span>{ translate( 'See how Jetpack can help grow your business or hobby' ) }</span>
			</a>
		</>
	);
};
