/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
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
			id: 'dont-need-it',
			answerText: translate( "I don't need it." ),
			textInput: true,
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
			<CardHeading tagName="h3" size={ 24 }>
				{ translate( 'One question before you go.' ) }
			</CardHeading>
			<p>
				{ translate( 'Before you go a quick question to help improve our G Suite integration.' ) }
			</p>
			<MultipleChoiceQuestion
				className="gsuite-cancel-purchase-dialog__survey"
				question={ question }
				answers={ answers }
				onAnswerChange={ onSurveryAnswerChange }
			/>
		</Fragment>
	);
};

GSuiteCancellationSurvey.propTypes = {
	onSurveryAnswerChange: PropTypes.func.isRequired,
	translate: PropTypes.func,
};

export default localize( GSuiteCancellationSurvey );
