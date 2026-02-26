import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/route';
import { getSectionName } from 'calypso/state/ui/selectors';

import './style.scss';

const TelexBanner = () => {
	const { __ } = useI18n();
	const sectionName = useSelector( getSectionName );

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_telex_banner_click', { section: sectionName } );
	}, [ sectionName ] );

	const telexUrl = addQueryArgs( { ref: sectionName + '-lp' }, 'https://telex.automattic.ai/' );

	return (
		<div className="telex-banner">
			<h2 className="telex-banner__title">{ __( 'Build WordPress blocks with AI' ) }</h2>
			<p className="telex-banner__description">
				{ preventWidows(
					__(
						'Experiment with ideas, test quickly, and create blocks without writing code in Telex.'
					)
				) }
			</p>
			<Button
				className="telex-banner__cta is-primary"
				href={ telexUrl }
				target="_blank"
				onClick={ trackClick }
			>
				{ __( 'Experiment with Telex' ) }
			</Button>
			<img
				className="telex-banner__mobile-illustration"
				src="/calypso/images/plugins/dithered-illustration-m.webp"
				alt=""
				aria-hidden="true"
			/>
			<div className="telex-banner__prompt-overlay">
				{ __( "I want a block with a countdown to my cat's birthday…" ) }
			</div>
		</div>
	);
};

export default TelexBanner;
