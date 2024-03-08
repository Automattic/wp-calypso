import { Gravatar } from '@automattic/components';
import { useHappinessEngineersQuery } from '@automattic/data-stores';
import { shuffle } from 'lodash';
import { useMemo } from 'react';

import './style.scss';

export const HappinessEngineersTray = ( { count = 5, shuffled = true } ) => {
	const { data } = useHappinessEngineersQuery();

	const filteredHappinessEngineers = useMemo( () => {
		if ( ! data ) {
			return null;
		}

		return ( shuffled ? shuffle( data ) : data ).slice( 0, count );
	}, [ data, count, shuffled ] );

	if ( ! filteredHappinessEngineers ) {
		return null;
	}
	const gravatars = filteredHappinessEngineers.map( ( user ) => (
		<Gravatar
			key={ user.avatar_URL }
			user={ user }
			size={ 42 }
			className="happiness-engineers-tray__gravatar"
		/>
	) );

	return <div className="happiness-engineers-tray">{ gravatars }</div>;
};
