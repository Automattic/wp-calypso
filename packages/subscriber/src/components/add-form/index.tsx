/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload, Button, Notice } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import './style.scss';

interface Props {
	showTitleEmoji?: boolean;
	showSkipBtn?: boolean;
	submitBtnName?: string;
	onSkipBtnClick?: () => void;
}

export const AddSubscriberForm: FunctionComponent< Props > = ( props ) => {
	const __ = useTranslate();
	const { showTitleEmoji, showSkipBtn, submitBtnName, onSkipBtnClick } = props;

	const [ selectedFile, setSelectedFile ] = useState< File >();
	const [ emails, setEmails ] = useState< string[] >( [] );
	const [ isValidEmails, setIsValidEmails ] = useState< boolean[] >( [] );
	const [ formFileUploadElement ] = useState(
		createElement( FormFileUpload, { onChange: onFileInputChange } )
	);

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

	function onFileInputChange( e: ChangeEvent< HTMLInputElement > ) {
		const f = e.target.files;
		f && f.length && setSelectedFile( f[ 0 ] );
	}

	return (
		<div className={ 'add-subscriber' }>
			<Notice isDismissible={ false }>You have 1 email list importing...</Notice>
			<div className={ 'add-subscriber__title-container' }>
				{ showTitleEmoji && <h2 className={ 'add-subscriber__title-emoji' }>🤝</h2> }
				<Title>Add subscribers to build your audience</Title>
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

					{ selectedFile && (
						<label className={ 'add-subscriber__form-label-links' }>
							{ createInterpolateElement(
								sprintf(
									/* translators: the first string variable shows a selected file name, Replace and Remove are links" */
									__(
										'<strong>%s</strong> <uploadBtn>Replace</uploadBtn> | <removeBtn>Remove</removeBtn>'
									),
									selectedFile?.name
								),
								{
									strong: createElement( 'strong' ),
									uploadBtn: formFileUploadElement,
									removeBtn: createElement( Button, {
										isLink: true,
										onClick: () => setSelectedFile( undefined ),
									} ),
								}
							) }
						</label>
					) }

					{ ! selectedFile && (
						<label>
							{ createInterpolateElement(
								__(
									'Or bring your mailing list from other newsletter services by <uploadBtn>uploading a CSV file.</uploadBtn>'
								),
								{ uploadBtn: formFileUploadElement }
							) }
						</label>
					) }

					<NextButton type={ 'submit' } className={ 'add-subscriber__form-submit-btn' }>
						{ submitBtnName || 'Add subscribers' }
					</NextButton>
					{ showSkipBtn && (
						<SkipButton
							className={ 'add-subscriber__form-skip-btn' }
							onClick={ () => onSkipBtnClick?.() }
						>
							Not yet
						</SkipButton>
					) }
					<p className={ 'add-subscriber__form--disclaimer' }>
						By adding a mailing list CSV, you are confirming that you have the rights to share
						newsletters with the people within your list.{ ' ' }
						<Button isLink={ true }>Learn more</Button>
					</p>
				</form>
			</div>
		</div>
	);
};
