import { shuffle } from 'lodash';
import Gravatar from 'calypso/components/gravatar';
import useHappinessEngineersQuery from 'calypso/data/happiness-engineers/use-happiness-engineers-query';

import './style.scss';

const HappinessEngineersTray = () => {
	const { data } = useHappinessEngineersQuery();

	return (
		<div className="happiness-engineers-tray">
			{ data &&
				shuffle( data ).map( ( { avatar_URL } ) => (
					<Gravatar
						key={ avatar_URL }
						user={ { avatar_URL } }
						size={ 42 }
						className="happiness-engineers-tray__gravatar"
					/>
				) ) }
		</div>
	);
};

export default HappinessEngineersTray;
