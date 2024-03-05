import { Gravatar } from '@automattic/components';
import { useHappinessEngineersQuery } from '@automattic/data-stores';
import { shuffle } from 'lodash';
import { useMemo } from 'react';

import './style.scss';

export const HappinessEngineersTray = ( { count = 5, shuffled = true } ) => {
	const { data } = useHappinessEngineersQuery();

	const gravatars = useMemo( () => {
		if ( ! data ) {
			return null;
		}

		const filteredHappinessEngineers = ( shuffled ? shuffle( data ) : data ).slice( 0, count );

		return filteredHappinessEngineers.map( ( user ) => (
			<Gravatar
				key={ user.avatar_URL }
				user={ user }
				size={ 42 }
				className="happiness-engineers-tray__gravatar"
			/>
		) );
	}, [ data, count, shuffled ] );

	return <div className="happiness-engineers-tray">{ gravatars }</div>;
};
