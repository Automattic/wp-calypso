import config from '@automattic/calypso-config';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';
import { isJetpackSite } from 'calypso/state/sites/selectors';

type StatsModuleListingProps = {
	children: React.ReactNode;
	className: string | null;
	siteId: number | null;
};

function StatsModuleListing( { children, className, siteId }: StatsModuleListingProps ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const fullClassName = clsx(
		className ?? '',
		'stats__module--unified',
		'stats__module-list',
		'stats__flexible-grid-container',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		}
	);

	if ( ! siteId ) {
		return null;
	}

	return <div className={ fullClassName }>{ children }</div>;
}

export default StatsModuleListing;
