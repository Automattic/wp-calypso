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

function StatsModuleListing( props: StatsModuleListingProps ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, props.siteId ) );

	const fullClassName = clsx(
		props.className ?? '',
		'stats__module--unified',
		'stats__module-list',
		'stats__flexible-grid-container',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		}
	);

	if ( ! props.siteId ) {
		return null;
	}

	return <div className={ fullClassName }>{ props.children }</div>;
}

export default StatsModuleListing;
