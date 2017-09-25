/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryHappinessEngineers from 'components/data/query-happiness-engineers';
import FormSectionHeading from 'components/forms/form-section-heading';
import Gravatar from 'components/gravatar';
import { getHappinessEngineers, hasReceivedHappinessEngineers } from 'state/happiness-engineers/selectors';

function HelpHappinessEngineers( { translate, happinessEngineers, hasReceived } ) {
	return (
		<div className="help-happiness-engineers">
			{ translate( '{{headline}}We care about your happiness!{{/headline}}' +
				'{{p}}They don\'t call us Happiness Engineers for nothing. ' +
				'If you need help, we\'re here for you!{{/p}}',
				{
					components: {
						headline: <FormSectionHeading />,
						p: <p className="help-happiness-engineers__description" />
					}
				}
				) }
			<div className="help-happiness-engineers__tray">
				{ shuffle( happinessEngineers ).map(
					happinessEngineer => <Gravatar
						key={ happinessEngineer }
						user={ { avatar_URL: happinessEngineer } }
						size={ 42 } /> )
				}
			</div>
			{ ! hasReceived && <QueryHappinessEngineers /> }
		</div>
	);
}

export default connect(
	( state ) => {
		return {
			happinessEngineers: getHappinessEngineers( state ),
			hasReceived: hasReceivedHappinessEngineers( state )
		};
	}
)( localize( HelpHappinessEngineers ) );
