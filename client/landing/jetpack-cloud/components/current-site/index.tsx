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
import Site from 'blocks/site';

/**
 * Style dependencies
 */
import './style.scss';

const CurrentSite = () => {
	const selectedSite = useSelector( state => getSelectedSite( state ) );

	return selectedSite ? (
		<Card className="current-site">
			<Site showHomeIcon={ false } site={ selectedSite } />
		</Card>
	) : null;
};

export default CurrentSite;
