/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { EVENT_NAVIGATE } from '../../constants';
import useLogoGenerator from '../hooks/use-logo-generator';
import './history-carousel.scss';
/**
 * Types
 */
import type React from 'react';

export const HistoryCarousel: React.FC = () => {
	const { logos, selectedLogo, setSelectedLogoIndex, context } = useLogoGenerator();

	const handleClick = ( index: number ) => {
		recordTracksEvent( EVENT_NAVIGATE, {
			context,
			logos_count: logos.length,
			selected_logo: index + 1,
		} );
		setSelectedLogoIndex( index );
	};

	const thumbnailFrom = ( url: string ): string => {
		const thumbnailURL = new URL( url );

		if ( ! thumbnailURL.searchParams.has( 'resize' ) ) {
			thumbnailURL.searchParams.append( 'resize', '48,48' );
		}

		return thumbnailURL.toString();
	};

	return (
		<div className="jetpack-ai-logo-generator__carousel">
			{ logos.map( ( logo, index ) => (
				<Button
					key={ logo.url }
					className={ clsx( 'jetpack-ai-logo-generator__carousel-logo', {
						'is-selected': logo.url === selectedLogo.url,
					} ) }
					onClick={ () => handleClick( index ) }
				>
					<img src={ thumbnailFrom( logo.url ) } alt={ logo.description } />
				</Button>
			) ) }
		</div>
	);
};
