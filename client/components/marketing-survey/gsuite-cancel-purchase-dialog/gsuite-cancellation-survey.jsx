/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MultipleChoiceQuestion from 'components/multiple-choice-question';

const GSuiteCancellationSurvey = ( { translate /*, onInputChange */ } ) => {
	const question = translate( 'Please tell us why you are cancelling G Suite:' );

	const answers = [
		{
			id: 'too-expensive',
			answerText: translate( "It's too expensive." ),
		},
		{
			id: 'dont-need-it',
			answerText: translate( "I don't need it." ),
		},
		{
			id: 'purchased-by-mistake',
			answerText: translate( 'I purchased it by mistake.' ),
		},
		{
			id: 'another-reason',
			answerText: translate( 'Another reason…' ),
			doNotShuffle: true,
			textInput: true,
		},
	];

	return (
		<Fragment>
			<MultipleChoiceQuestion
				question={ question }
				answers={ answers }
				onAnwserChange={ () => {
					/* need to call onInputChange here */
				} }
			/>
		</Fragment>
	);
};

GSuiteCancellationSurvey.propTypes = {
	translate: PropTypes.func,
};

export default localize( GSuiteCancellationSurvey );
