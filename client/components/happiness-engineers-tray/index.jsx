/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { shuffle } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import QueryHappinessEngineers from 'components/data/query-happiness-engineers';
import {
	getHappinessEngineers,
	hasReceivedHappinessEngineers,
} from 'state/happiness-engineers/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const HappinessEngineersTray = ( { alreadyReceivedHappinessEngineers, happinessEngineers } ) => (
	<div className="happiness-engineers-tray">
		{ ! alreadyReceivedHappinessEngineers && <QueryHappinessEngineers /> }
		{ shuffle( happinessEngineers ).map( ( happinessEngineer ) => (
			<Gravatar
				key={ happinessEngineer }
				user={ { avatar_URL: happinessEngineer } }
				size={ 42 }
				className="happiness-engineers-tray__gravatar"
			/>
		) ) }
	</div>
);

export default connect( ( state ) => ( {
	happinessEngineers: getHappinessEngineers( state ),
	alreadyReceivedHappinessEngineers: hasReceivedHappinessEngineers( state ),
} ) )( HappinessEngineersTray );
