/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo.svg';

const Cloudflare = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordClick = () => {
		dispatch(
			composeAnalytics( recordTracksEvent( 'calypso_performance_settings_cloudflare_click' ) )
		);
	};

	return (
		<div className="stats__card">
			<div className="stats__card-text">
				<h2 className="stats__card-title">
					{ translate( 'Gain deeper insights with Cloudflare Analytics' ) }
				</h2>
				<p className="stats__card-description">
					{ translate(
						'Cloudflare Analytics empowers you with deep insights and intelligene to protect and accelerate your site.'
					) }
				</p>
				<Button onClick={ recordClick } href="CLOUDFLARELINK" target="_blank">
					{ translate( 'Learn More' ) }
				</Button>
			</div>
			{ isDesktop() && (
				<div className="stats__card-illustration">
					<img src={ cloudflareIllustration } alt="" />
				</div>
			) }
		</div>
	);
};

export default Cloudflare;
