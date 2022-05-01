import { useHappinessEngineersQuery } from '@automattic/data-stores';
import { shuffle } from 'lodash';
import { Gravatar } from '../gravatar';

import './style.scss';

export const HappinessEngineersTray = ( { count = 5 } ) => {
	const { data } = useHappinessEngineersQuery();

	return (
		<div className="happiness-engineers-tray">
			{ data &&
				shuffle( data )
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
