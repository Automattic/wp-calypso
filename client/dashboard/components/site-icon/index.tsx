import clsx from 'clsx';
import { useMemo } from 'react';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteStatus } from '../../utils/site-status';
import SiteMigrationIcon from './site-migration-icon';
import type { Site } from '@automattic/api-core';

import './style.scss';

export default function SiteIcon( { site, size }: { site: Site; size?: number } ) {
	const status = getSiteStatus( site );
	const isMigration = status === 'migration_pending' || status === 'migration_started';
	const fallbackInitial = getSiteDisplayName( site ).charAt( 0 );
	return (
		<SiteIconRenderer
			alt={ site.name }
			fallbackInitial={ fallbackInitial }
			icon={ site.icon }
			isMigration={ isMigration }
			size={ size }
		/>
	);
}

/**
 * The SiteIconRenderer component allows you to render a site icon when you
 * don't happen to have a `Site` object on hand.
 */
export function SiteIconRenderer( {
	alt,
	fallbackInitial,
	icon,
	isMigration,
	size = 48,
}: {
	alt: string;
	fallbackInitial: string;
	icon?: { img: string; ico: string };
	isMigration: boolean;
	size?: number;
} ) {
	const dims = { width: size, height: size };
	const ico = icon?.img || icon?.ico;
	const src = useMemo( () => {
		if ( ! ico ) {
			return;
		}
		const url = new URL( ico );
		// wordpress.com/wp-content works with w.
		url.searchParams.set( 'w', '96' );
		// "blavatar" works with s.
		url.searchParams.set( 's', '96' );
		return url.toString();
	}, [ ico ] );

	const className = clsx( {
		'is-small': size <= 16,
	} );

	if ( ico ) {
		return (
			<img
				className={ clsx( 'site-icon', className ) }
				src={ src }
				alt={ alt }
				{ ...dims }
				loading="lazy"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	if ( isMigration ) {
		return <SiteMigrationIcon className={ clsx( 'site-icon', className ) } size={ size } />;
	}

	return (
		<div className={ clsx( 'site-letter', className ) } style={ { ...dims, fontSize: size * 0.5 } }>
			<span>{ fallbackInitial }</span>
		</div>
	);
}
