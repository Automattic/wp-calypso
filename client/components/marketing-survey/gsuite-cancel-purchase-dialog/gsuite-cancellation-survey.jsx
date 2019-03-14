/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MultipleChoiceQuestion from 'components/multiple-choice-question';

const GSuiteCancellationSurvey = ( { onSurveryAnswerChange, translate } ) => {
	const question = translate( 'Please tell us why you are cancelling G Suite:' );

	const answers = [
		{
			id: 'too-expensive',
			answerText: translate( "It's too expensive." ),
			textInput: true,
		},
		{
			id: 'do-not-need-it',
			answerText: translate( "I don't need it." ),
			textInput: true,
		},
		{
			id: 'purchased-by-mistake',
			answerText: translate( 'I purchased it by mistake.' ),
		},
		{
			id: 'it-did-not-work',
			answerText: translate( "It didn't work." ),
		},
		{
			id: 'another-reason',
			answerText: translate( 'Another reason…' ),
			doNotShuffle: true,
			textInput: true,
		},
	];

	return (
		<div className="gsuite-cancel-purchase-dialog__survey">
			<MultipleChoiceQuestion
				question={ question }
				answers={ answers }
				onAnswerChange={ onSurveryAnswerChange }
			/>
		</div>
	);
};

GSuiteCancellationSurvey.propTypes = {
	onSurveryAnswerChange: PropTypes.func.isRequired,
	translate: PropTypes.func,
};

export default localize( GSuiteCancellationSurvey );
