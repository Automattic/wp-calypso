/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { connect } from 'react-redux';
import { shuffle } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';
import Gravatar from 'components/gravatar';
import QueryHappinessEngineers from 'components/data/query-happiness-engineers';
import { getHappinessEngineers } from 'state/happiness-engineers/selectors';
import CardHeading from 'components/card-heading';

const DataLossWarning = ( { avatars, translate } ) => {
	return (
		<Card className="data-loss-warning">
			{ ! avatars && <QueryHappinessEngineers /> }
			<CardHeading>{ translate( 'Support' ) }</CardHeading>
			<div className="data-loss-warning__avatars">
				{ shuffle( avatars ).map( avatar => (
					<Gravatar key={ avatar } user={ { avatar_URL: avatar } } size={ 42 } />
				) ) }
			</div>
			<p>
				{ translate(
					'If you need help or have any questions, our Happiness Engineers are here when you need them.'
				) }
			</p>
			<Button href={ '/help/contact/' }>{ translate( 'Contact us' ) }</Button>
		</Card>
	);
};

export default connect( state => ( {
	avatars: getHappinessEngineers( state ),
} ) )( localize( DataLossWarning ) );
