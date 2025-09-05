import clsx from 'clsx';
import { useMemo } from 'react';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteStatus } from '../../utils/site-status';
import SiteMigrationIcon from './site-migration-icon';
import type { Site } from '@automattic/api-core';

import './style.scss';

export default function SiteIcon( { site, size = 48 }: { site: Site; size?: number } ) {
	const dims = { width: size, height: size };
	const ico = site.icon?.ico;
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
				alt={ site.name }
				{ ...dims }
				loading="lazy"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	const status = getSiteStatus( site );
	if ( status === 'migration_pending' || status === 'migration_started' ) {
		return <SiteMigrationIcon className={ clsx( 'site-icon', className ) } size={ size } />;
	}

	return (
		<div className={ clsx( 'site-letter', className ) } style={ { ...dims, fontSize: size * 0.5 } }>
			<span>{ getSiteDisplayName( site ).charAt( 0 ) }</span>
		</div>
	);
}
