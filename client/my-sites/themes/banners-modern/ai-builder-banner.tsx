import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const AIBuilderBanner = () => {
	const { __ } = useI18n();

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_ai_builder_banner_click' );
	}, [] );

	return (
		<div className="ai-builder-banner">
			<div className="ai-builder-banner__content">
				<h2 className="ai-builder-banner__title">{ __( 'Create my theme with AI' ) }</h2>
				<p className="ai-builder-banner__description">
					{ preventWidows( __( 'Generate a one-of-a-kind website by chatting with AI.' ) ) }
				</p>
				<Button
					className="ai-builder-banner__button"
					variant="primary"
					href="/setup/ai-site-builder"
					onClick={ trackClick }
				>
					{ __( 'Start with AI' ) }
				</Button>
			</div>
		</div>
	);
};

export default AIBuilderBanner;
