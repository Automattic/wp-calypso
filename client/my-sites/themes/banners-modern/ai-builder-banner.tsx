import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import bigSkyLogo from 'calypso/assets/images/icons/big-sky.svg';
import wordpressLogo from 'calypso/assets/images/icons/wordpress-logo.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const AIBuilderBanner = () => {
	const translate = useTranslate();

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_ai_builder_banner_click' );
	}, [] );

	return (
		<div className="ai-builder-banner">
			<div className="ai-builder-banner__content">
				<h2 className="ai-builder-banner__title">{ translate( 'Create my theme with AI' ) }</h2>
				<p className="ai-builder-banner__description">
					{ preventWidows( translate( 'Generate a one-of-a-kind website by chatting with AI.' ) ) }
				</p>
				<Button
					className="ai-builder-banner__button"
					variant="primary"
					href="/setup/ai-site-builder"
					onClick={ trackClick }
				>
					{ translate( 'Start with AI' ) }
				</Button>
			</div>
			<div className="ai-builder-banner__byline" aria-hidden="true">
				<img className="ai-builder-banner__byline-wp" src={ wordpressLogo } alt="WordPress.com" />
				<span>{ translate( 'With AI' ) }</span>
				<img
					className="ai-builder-banner__byline-ai"
					src={ bigSkyLogo }
					alt={ translate( 'AI' ) }
				/>
			</div>
		</div>
	);
};

export default AIBuilderBanner;
