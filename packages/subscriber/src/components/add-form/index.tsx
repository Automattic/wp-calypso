/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, check, info } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import React, {
	ChangeEvent,
	FormEvent,
	FunctionComponent,
	useState,
	useEffect,
	useRef,
} from 'react';
import { useActiveJobRecognition } from '../../hooks/use-active-job-recognition';
import { useInProgressState } from '../../hooks/use-in-progress-state';
import { SUBSCRIBER_STORE } from '../../store';
import './style.scss';
import { AddSubscribersProgressScreen } from './progress-screen';

interface Props {
	siteId: number;
	showTitleEmoji?: boolean;
	showSkipBtn?: boolean;
	showCsvUpload?: boolean;
	submitBtnName?: string;
	onSkipBtnClick?: () => void;
	onImportFinished?: () => void;
}

export const AddSubscriberForm: FunctionComponent< Props > = ( props ) => {
	const __ = useTranslate();
	const {
		siteId,
		showTitleEmoji,
		showSkipBtn,
		showCsvUpload,
		submitBtnName,
		onSkipBtnClick,
		onImportFinished,
	} = props;

	const { addSubscribers, importCsvSubscribers, getSubscribersImports } =
		useDispatch( SUBSCRIBER_STORE );

	/**
	 * ↓ Fields
	 */
	const inProgress = useInProgressState();
	const prevInProgress = useRef( inProgress );
	const [ selectedFile, setSelectedFile ] = useState< File >();
	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( true );
	const [ emails, setEmails ] = useState< string[] >( [] );
	const [ isValidEmails, setIsValidEmails ] = useState< boolean[] >( [] );
	const [ formFileUploadElement ] = useState(
		createElement( FormFileUpload, { name: 'import', onChange: onFileInputChange } )
	);

	/**
	 * ↓ Effects
	 */
	useEffect( () => {
		prevInProgress.current = inProgress;
	}, [ inProgress ] );
	// get initial list of jobs
	useEffect( () => {
		getSubscribersImports( siteId );
	}, [] );
	// reset form when add/import starts
	useEffect( () => {
		inProgress && resetForm();
	}, [ inProgress ] );
	// run active job recognition process which updates state
	useActiveJobRecognition( siteId );

	! inProgress && prevInProgress.current && onImportFinished?.();

	/**
	 * ↓ Functions
	 */
	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();

		const validEmails = isValidEmails
			.map( ( x, i ) => {
				if ( x ) return emails[ i ];
			} )
			.filter( ( x ) => !! x ) as string[];

		validEmails.length && addSubscribers( siteId, validEmails );
		selectedFile && importCsvSubscribers( siteId, selectedFile );
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

	function isValidExtension( fileName: string ) {
		const extensionRgx = new RegExp( /[^\\]*\.(?<extension>\w+)$/ );
		const validExtensions = [ 'csv' ];
		const match = extensionRgx.exec( fileName );

		return validExtensions.includes( match?.groups?.extension.toLowerCase() as string );
	}

	function onFileInputChange( e: ChangeEvent< HTMLInputElement > ) {
		const f = e.target.files;
		if ( ! f || ! f.length ) return;

		const file = f[ 0 ];
		const isValid = isValidExtension( file.name );

		setIsSelectedFileValid( isValid );
		isValid && setSelectedFile( file );
	}

	function resetForm() {
		setEmails( [] );
		setIsValidEmails( [] );
		setSelectedFile( undefined );
	}

	/**
	 * ↓ Templates
	 */
	return (
		<div className={ 'add-subscriber' }>
			{ inProgress && <AddSubscribersProgressScreen /> }
			{ ! inProgress && (
				<>
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
								onChange={ ( value ) => onEmailChange( value, 1 ) }
							/>
							<TextControl
								placeholder={ 'friend@email.com' }
								value={ emails[ 2 ] || '' }
								help={ isValidEmails[ 2 ] ? <Icon icon={ check } /> : undefined }
								onChange={ ( value ) => onEmailChange( value, 2 ) }
							/>

							{ ! isSelectedFileValid && (
								<label className={ 'add-subscriber__form-label-error' }>
									{ createInterpolateElement(
										__(
											'<span><icon /> Sorry, you can only upload a CSV file.</span><uploadBtn>Select another file</uploadBtn>'
										),
										{
											span: createElement( 'span' ),
											icon: createElement( Icon, { icon: info, size: 20 } ),
											uploadBtn: formFileUploadElement,
										}
									) }
								</label>
							) }

							{ isSelectedFileValid && selectedFile && (
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

							{ showCsvUpload && isSelectedFileValid && ! selectedFile && (
								<>
									<label>
										{ createInterpolateElement(
											__(
												'Or bring your mailing list from other newsletter services by <uploadBtn>uploading a CSV file.</uploadBtn>'
											),
											{ uploadBtn: formFileUploadElement }
										) }
									</label>
								</>
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
							{ showCsvUpload && (
								<p className={ 'add-subscriber__form--disclaimer' }>
									By adding a mailing list CSV, you are confirming that you have the rights to share
									newsletters with the people within your list.{ ' ' }
									<Button isLink={ true }>Learn more</Button>
								</p>
							) }
						</form>
					</div>
				</>
			) }
		</div>
	);
};
