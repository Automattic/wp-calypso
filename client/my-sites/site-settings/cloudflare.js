/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo.svg';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import config from '@automattic/calypso-config';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

const Cloudflare = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const showCloudflare = config.isEnabled( 'cloudflare' );

	const recordClick = () => {
		dispatch(
			composeAnalytics( recordTracksEvent( 'calypso_performance_settings_cloudflare_click' ) )
		);
	};

	return (
		<>
			{ showCloudflare && (
				<>
					<SettingsSectionHeader title={ translate( 'Cloudflare CDN' ) } />
					<Card>
						<div className="site-settings__cloudflare">
							<div className="site-settings__cloudflare-text">
								<p>
									{ translate(
										'Use the Cloudflare global server network to optimize your site content and create a faster experience for your users regardless of their device or location.'
									) }
								</p>

								<Button
									onClick={ recordClick }
									href="https://www.CLOUDFLARELINK.com"
									target="_blank"
								>
									{ translate( 'Learn more' ) }
								</Button>
							</div>

							{ isDesktop() && (
								<div className="site-settings__cloudflare-illustration">
									<img src={ cloudflareIllustration } alt="" />
								</div>
							) }
						</div>
					</Card>
				</>
			) }
		</>
	);
};

export default Cloudflare;
