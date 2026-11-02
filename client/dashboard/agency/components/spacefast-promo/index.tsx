import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import NewTabLabel from '../new-tab-label';
import { getSpacefastUrl } from './constants';
import SpacefastSymbol from './spacefast-symbol';
import type { RecordTracksEvent } from '../../tiers/types';

import './style.scss';

interface SpacefastSidebarCardProps {
	/** Injected so the dashboard and a8c-for-agencies can each pass their own analytics client. */
	recordTracksEvent: RecordTracksEvent;
}

/**
 * Compact Spacefast card at the bottom of the agency sidebar, in both the
 * dashboard and a8c-for-agencies.
 */
export default function SpacefastSidebarCard( { recordTracksEvent }: SpacefastSidebarCardProps ) {
	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'sidebar' } );
		}
	}, [ recordTracksEvent ] );

	return (
		<a
			className="a4a-spacefast-sidebar-card"
			href={ getSpacefastUrl( 'sidebar' ) }
			target="_blank"
			rel="noreferrer"
			onClick={ () =>
				recordTracksEvent( 'calypso_a4a_spacefast_promo_click', { placement: 'sidebar' } )
			}
		>
			<span className="a4a-spacefast-sidebar-card__logo">
				<SpacefastSymbol />
			</span>
			<span className="a4a-spacefast-sidebar-card__text">
				<span className="a4a-spacefast-sidebar-card__title">
					{ __( 'Spacefast' ) }
					<span className="a4a-spacefast-sidebar-card__badge">{ __( 'New' ) }</span>
				</span>
				<span className="a4a-spacefast-sidebar-card__description">
					{ __( 'Publish and share what your agents make.' ) }
				</span>
				<span className="a4a-spacefast-sidebar-card__link">
					<NewTabLabel justify="flex-start">
						<span className="a4a-spacefast-sidebar-card__link-label">
							{ __( 'Try Spacefast' ) }
						</span>
					</NewTabLabel>
				</span>
			</span>
		</a>
	);
}
