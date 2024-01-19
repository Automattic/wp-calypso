/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
/**
 * Internal dependencies
 */
import { EVENT_NAVIGATE_LOGOS } from '../../constants';
import { STORE_NAME } from '../store';
import './history-carousel.scss';
/**
 * Types
 */
import type { Selectors } from '../store/types';
import type React from 'react';

export const HistoryCarousel: React.FC = () => {
	const { setSelectedLogoIndex } = useDispatch( STORE_NAME );

	const { logos, selectedLogo } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return { logos: selectors.getLogos(), selectedLogo: selectors.getSelectedLogo() };
	}, [] );

	const handleClick = ( index: number ) => {
		recordTracksEvent( EVENT_NAVIGATE_LOGOS, {
			logos_count: logos.length,
			selected_logo: index + 1,
		} );
		setSelectedLogoIndex( index );
	};

	return (
		<div className="jetpack-ai-logo-generator__carousel">
			{ logos.map( ( logo, index ) => (
				<Button
					key={ logo.url }
					className={ classnames( 'jetpack-ai-logo-generator__carousel-logo', {
						'is-selected': logo.url === selectedLogo.url,
					} ) }
					onClick={ () => handleClick( index ) }
				>
					<img src={ logo.url } alt={ logo.description } />
				</Button>
			) ) }
		</div>
	);
};
