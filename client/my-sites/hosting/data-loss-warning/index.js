/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button } from '@automattic/components';
import { connect } from 'react-redux';
import { shuffle } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';
import Gravatar from 'components/gravatar';
import QueryHappinessEngineers from 'components/data/query-happiness-engineers';
import { getHappinessEngineers } from 'state/happiness-engineers/selectors';

const DataLossWarning = ( { avatars, translate } ) => {
	return (
		<div className="data-loss-warning">
			{ ! avatars && <QueryHappinessEngineers /> }
			<h2>{ translate( 'Unsure of what all this means?' ) }</h2>
			<p>
				<strong>
					{ translate(
						"Mistakes when editing your website's files and database can lead to data loss."
					) }
				</strong>
				&nbsp;
				{ translate(
					'If you need help or have any questions our Happiness Engineers are here when you need them!'
				) }
			</p>
			<div className="data-loss-warning__contact">
				<Button href={ '/help/contact/' }>{ translate( 'Contact us' ) }</Button>
				{ shuffle( avatars ).map( avatar => (
					<Gravatar key={ avatar } user={ { avatar_URL: avatar } } size={ 42 } />
				) ) }
			</div>
		</div>
	);
};

export default connect( state => ( {
	avatars: getHappinessEngineers( state ),
} ) )( localize( DataLossWarning ) );
