/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@wordpress/components';
import cookie from 'cookie';
import React from 'react';
import { Survey, SurveyTriggerAccept, SurveyTriggerSkip } from '../';

const SURVEY_NAME = 'survey-test';

const removeSurveyCookie = () => {
	document.cookie = cookie.serialize( SURVEY_NAME, 'skip', {
		expires: new Date( 0 ),
	} );
};

describe( 'Survey', () => {
	beforeEach( () => {
		removeSurveyCookie();
	} );

	it( 'renders the survey content', () => {
		render(
			<Survey name={ SURVEY_NAME }>
				<h1>Survey</h1>
			</Survey>
		);
		expect( screen.getByText( 'Survey' ) ).toBeInTheDocument();
	} );

	it( 'closes the survey when ok button is clicked', async () => {
		render(
			<Survey name={ SURVEY_NAME }>
				<h1>Survey</h1>

				<SurveyTriggerAccept>
					<a href="#testing">Take the survey</a>
				</SurveyTriggerAccept>
			</Survey>
		);
		await userEvent.click( screen.getByText( 'Take the survey' ) );

		expect( screen.queryByText( 'Survey' ) ).not.toBeInTheDocument();
	} );

	it( 'skips the survey when the skip trigger is clicked', async () => {
		render(
			<Survey name={ SURVEY_NAME }>
				<h1>Survey</h1>

				<SurveyTriggerSkip>
					<Button>Thanks</Button>
				</SurveyTriggerSkip>
			</Survey>
		);
		await userEvent.click( screen.getByText( /Thanks/ ) );

		expect( screen.queryByText( 'Survey' ) ).not.toBeInTheDocument();
	} );

	it( 'triggers onAccept callback when user accepts', async () => {
		const onAccept = jest.fn();
		render(
			<Survey name={ SURVEY_NAME } onAccept={ onAccept }>
				<h1>Survey</h1>

				<SurveyTriggerAccept>
					<a href="#testing">Take the survey</a>
				</SurveyTriggerAccept>
			</Survey>
		);

		await userEvent.click( screen.getByText( 'Take the survey' ) );

		expect( onAccept ).toHaveBeenCalled();
	} );

	it( 'triggers onSkip callback when user skips', async () => {
		const onSkip = jest.fn();
		render(
			<Survey name={ SURVEY_NAME } onSkip={ onSkip }>
				<h1>Survey</h1>

				<SurveyTriggerSkip asChild>
					<Button>Thanks</Button>
				</SurveyTriggerSkip>
			</Survey>
		);

		await userEvent.click( screen.getByText( 'Thanks' ) );

		expect( onSkip ).toHaveBeenCalled();
	} );

	it( "doesn't render the survey when it was already skipped", async () => {
		document.cookie = cookie.serialize( 'survey-test', 'skip' );

		render(
			<Survey name={ SURVEY_NAME }>
				<h1>Survey</h1>

				<SurveyTriggerSkip asChild>
					<Button>Thanks</Button>
				</SurveyTriggerSkip>
			</Survey>
		);

		expect( screen.queryByText( 'Survey' ) ).not.toBeInTheDocument();
	} );

	it( 'use trigger as child for accept', async () => {
		const onAccept = jest.fn();

		render(
			<Survey name={ SURVEY_NAME } onAccept={ onAccept }>
				<h1>Survey</h1>

				<SurveyTriggerAccept asChild>
					<a href="#testing">Take the survey</a>
				</SurveyTriggerAccept>
			</Survey>
		);

		await userEvent.click( screen.getByRole( 'link', { name: 'Take the survey' } ) );

		expect( onAccept ).toHaveBeenCalled();
		expect( screen.queryByText( 'Survey' ) ).not.toBeInTheDocument();
	} );

	it( 'use trigger as child for skip', async () => {
		const onSkip = jest.fn();

		render(
			<Survey name={ SURVEY_NAME } onSkip={ onSkip }>
				<h1>Survey</h1>

				<SurveyTriggerSkip asChild>
					<a href="#testing">Thanks</a>
				</SurveyTriggerSkip>
			</Survey>
		);

		await userEvent.click( screen.getByRole( 'link', { name: 'Thanks' } ) );

		expect( onSkip ).toHaveBeenCalled();
		expect( screen.queryByText( 'Survey' ) ).not.toBeInTheDocument();
	} );
} );
