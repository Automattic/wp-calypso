import config from '@automattic/calypso-config';
import { Spinner } from '@automattic/components';
import React from 'react';

const StatsLoader: React.FC = () => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	return (
		<div
			style={ {
				minHeight: 'calc( 100vh - 100px )',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			} }
		>
			{ isOdysseyStats ? (
				<img
					width="32"
					height="32"
					alt="Loading"
					src="//en.wordpress.com/i/loading/loading-64.gif"
				/>
			) : (
				<Spinner />
			) }
		</div>
	);
};

export default StatsLoader;
