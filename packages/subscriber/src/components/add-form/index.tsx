/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, SubTitle, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload } from '@wordpress/components';
import React, { FormEvent, FunctionComponent, useState } from 'react';
import './style.scss';

export const AddSubscriberForm: FunctionComponent = () => {
	const [ emails, setEmails ] = useState< string[] >( [] );

	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
	}

	function setEmail( value: string, index: number ) {
		const _emails = Array.from( emails );
		_emails[ index ] = value;
		setEmails( _emails );
	}

	return (
		<div className={ 'add-subscriber' }>
			<div className={ 'add-subscriber__title-container' }>
				<h2 className={ 'add-subscriber__title-emoji' }>🤝</h2>
				<Title>Add subscribers</Title>
				<SubTitle>You can invite some people to your list.</SubTitle>
			</div>
			<div className={ 'add-subscriber__form--container' }>
				<form onSubmit={ onFormSubmit }>
					<TextControl
						placeholder={ 'sibling@email.com' }
						value={ emails[ 0 ] || '' }
						onChange={ ( value ) => setEmail( value, 0 ) }
					/>
					<TextControl
						placeholder={ 'parents@email.com' }
						value={ emails[ 1 ] || '' }
						onChange={ ( value ) => setEmail( value, 1 ) }
					/>
					<TextControl
						placeholder={ 'friend@email.com' }
						value={ emails[ 2 ] || '' }
						onChange={ ( value ) => setEmail( value, 2 ) }
					/>

					<label>
						Or bring your mailing list from other newsletters by{ ' ' }
						<FormFileUpload
							onChange={ () => {
								/* on value change */
							} }
						>
							uploading a CSV file
						</FormFileUpload>
						.
					</label>

					<NextButton type={ 'submit' } className={ 'add-subscriber__form-submit-btn' }>
						Add subscribers
					</NextButton>
					<SkipButton className={ 'add-subscriber__form-skip-btn' }>Not yet</SkipButton>
				</form>
			</div>
		</div>
	);
};
