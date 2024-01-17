import { Gravatar } from '@automattic/components';
import { useHappinessEngineersQuery } from '@automattic/data-stores';
import { shuffle } from 'lodash';

import './style.scss';

export const HappinessEngineersTray = ( { count = 5, shuffled = true } ) => {
	const { data } = useHappinessEngineersQuery();

	return (
		<div className="happiness-engineers-tray">
			{ data &&
				( shuffled ? shuffle( data ) : data )
					.slice( 0, count )
					.map( ( user ) => (
						<Gravatar
							key={ user.avatar_URL }
							user={ user }
							size={ 42 }
							className="happiness-engineers-tray__gravatar"
						/>
					) ) }
		</div>
	);
};
