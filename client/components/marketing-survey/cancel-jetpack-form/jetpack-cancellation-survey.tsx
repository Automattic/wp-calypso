/**
 * External dependencies
 */
import React, { useState, ReactElement } from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import classnames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Card } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';

interface Choice {
	id: string;
	answer: TranslateResult;
}

interface JetpackCancellationSurveyProps {
	onAnswerClick: ( answerId: string ) => void;
}

export default function JetpackCancellationSurvey( {
	onAnswerClick,
}: JetpackCancellationSurveyProps ): ReactElement {
	const translate = useTranslate();
	const [ selectedAnswerId, setSelectedAnswerId ] = useState( '' );

	const choices: Choice[] = [
		{
			id: 'plan-expensive',
			answer: translate( 'The plan was too expensive.' ),
		},
		{
			id: 'downgrade',
			answer: translate( "I'd like to downgrade to another plan." ),
		},
		{
			id: 'upgrade-by-mistake',
			answer: translate( "This upgrade didn't include what I needed." ),
		},
		{
			id: 'can-not-activate',
			answer: translate( 'I was unable to activate or use the product.' ),
		},
		{
			id: 'other',
			answer: translate( 'Other:' ),
		},
	];

	const selectAnswer = ( answerId: string ) => {
		setSelectedAnswerId( answerId );
		onAnswerClick( answerId );
	};

	const renderChoiceCard = ( choice: Choice ): ReactElement => {
		return (
			<Card
				className={ classnames( {
					'jetpack-cancellation-survey__card': true,
					'is-selected': choice.id === selectedAnswerId,
				} ) }
				tagName="button"
				onClick={ () => selectAnswer( choice.id ) }
				key={ choice.id }
			>
				<div>{ choice.answer }</div>
				<Gridicon icon="chevron-right" size={ 12 } />
			</Card>
		);
	};

	return (
		<div className="jetpack-cancellation-survey__content">
			<FormattedHeader
				headerText={ translate( 'Before you go, help us improve Jetpack' ) }
				subHeaderText={ translate( 'Please let us know why you are cancelling.' ) }
				align="center"
			/>
			{ choices.map( renderChoiceCard ) }
		</div>
	);
}
