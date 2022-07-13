/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, SubTitle, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import emailValidator from 'email-validator';
import React, { FormEvent, FunctionComponent, useState } from 'react';
import './style.scss';

export const AddSubscriberForm: FunctionComponent = () => {
	const [ files, setFiles ] = useState< string[] >( [] );
	const [ emails, setEmails ] = useState< string[] >( [] );
	const [ isValidEmails, setIsValidEmails ] = useState< boolean[] >( [] );

	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
	}

	function onEmailChange( value: string, index: number ) {
		setEmail( value, index );
		setIsValidEmail( value, index );
	}

	function setEmail( value: string, index: number ) {
		const _emails = Array.from( emails );
		_emails[ index ] = value;
		setEmails( _emails );
	}

	function setIsValidEmail( value: string, index: number ) {
		const _isValidEmails = Array.from( isValidEmails );
		_isValidEmails[ index ] = emailValidator.validate( value );
		setIsValidEmails( _isValidEmails );
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
						help={ isValidEmails[ 0 ] ? <Icon icon={ check } /> : undefined }
						onChange={ ( value ) => onEmailChange( value, 0 ) }
					/>
					<TextControl
						placeholder={ 'parents@email.com' }
						value={ emails[ 1 ] || '' }
						help={ isValidEmails[ 1 ] ? <Icon icon={ check } /> : undefined }
						onChange={ ( value ) => setEmail( value, 1 ) }
					/>
					<TextControl
						placeholder={ 'friend@email.com' }
						value={ emails[ 2 ] || '' }
						help={ isValidEmails[ 2 ] ? <Icon icon={ check } /> : undefined }
						onChange={ ( value ) => setEmail( value, 2 ) }
					/>

					<label>
						{ !! files.length && 'Or bring your mailing list from other newsletters.' }
						{ ! files.length && 'Or bring your mailing list from other newsletters by' }
						{ !! files.length &&
							files.map( ( f, i ) => (
								<TextControl
									key={ i }
									value={ f }
									onChange={ () => {
										return;
									} }
									disabled
									help={ <Icon icon={ check } /> }
								/>
							) ) }
						<FormFileUpload
							onChange={ ( e ) => {
								/* on value change */
								const _files = Array.from( files );
								const f = e.target.files;
								f && f.length && _files.push( f[ 0 ].name );

								setFiles( _files );
							} }
						>
							{ !! files.length && 'Add another CSV file' }
							{ ! files.length && 'uploading a CSV file' }
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
