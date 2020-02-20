/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getSelectedSite } from 'state/ui/selectors';
import AllSites from 'blocks/all-sites';
import Site from 'blocks/site';

/**
 * Style dependencies
 */
import './style.scss';

const CurrentSite = () => {
	const selectedSite = useSelector( state => getSelectedSite( state ) );

	return (
		<Card className="current-site">
			{ selectedSite ? (
				<div>
					<Site showHomeIcon={ false } site={ selectedSite } homeLink={ true } />
				</div>
			) : (
				<AllSites />
			) }
		</Card>
	);
};

export default CurrentSite;
