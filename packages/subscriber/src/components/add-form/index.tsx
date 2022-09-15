/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Title, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload, Button, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
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
import { RecordTrackEvents, useRecordAddFormEvents } from '../../hooks/use-record-add-form-events';
import { SUBSCRIBER_STORE } from '../../store';
import { tip } from './icon';
import './style.scss';

interface Props {
	siteId: number;
	flowName?: string;
	showTitleEmoji?: boolean;
	showSkipBtn?: boolean;
	showCsvUpload?: boolean;
	submitBtnName?: string;
	allowEmptyFormSubmit?: boolean;
	recordTracksEvent?: RecordTrackEvents;
	onSkipBtnClick?: () => void;
	onImportFinished?: () => void;
}

export const AddSubscriberForm: FunctionComponent< Props > = ( props ) => {
	const __ = useTranslate();
	const {
		siteId,
		flowName,
		showTitleEmoji,
		showSkipBtn,
		showCsvUpload,
		submitBtnName,
		allowEmptyFormSubmit,
		recordTracksEvent,
		onSkipBtnClick,
		onImportFinished,
	} = props;

	const {
		addSubscribers,
		importCsvSubscribers,
		importCsvSubscribersUpdate,
		getSubscribersImports,
	} = useDispatch( SUBSCRIBER_STORE );

	/**
	 * ↓ Fields
	 */
	const emailControlMaxNum = 10;
	const emailControlPlaceholder = [
		__( 'sibling@example.com' ),
		__( 'parents@example.com' ),
		__( 'friend@example.com' ),
	];
	const inProgress = useInProgressState();
	const prevInProgress = useRef( inProgress );
	const [ selectedFile, setSelectedFile ] = useState< File >();
	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( true );
	const [ emails, setEmails ] = useState< string[] >( [] );
	const [ isValidEmails, setIsValidEmails ] = useState< boolean[] >( [] );
	const [ isDirtyEmails, setIsDirtyEmails ] = useState< boolean[] >( [] );
	const [ emailFormControls, setEmailFormControls ] = useState( emailControlPlaceholder );
	const importSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getImportSubscribersSelector() );
	const [ formFileUploadElement ] = useState(
		createElement( FormFileUpload, {
			name: 'import',
			onChange: onFileInputChange,
			disabled: inProgress,
		} )
	);

	/**
	 * ↓ Effects
	 */
	// get initial list of jobs
	useEffect( () => {
		getSubscribersImports( siteId );
	}, [] );
	// run active job recognition process which updates state
	useActiveJobRecognition( siteId );
	useEffect( extendEmailFormControls, [ emails ] );
	useEffect( importFinishedRecognition );

	useEffect( () => {
		prevInProgress.current = inProgress;
	}, [ inProgress ] );

	useRecordAddFormEvents( recordTracksEvent, flowName );

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

		! validEmails.length && ! selectedFile && allowEmptyFormSubmit && onImportFinished?.();
	}

	function onEmailChange( value: string, index: number ) {
		const _value = value.trim();
		setEmail( _value, index );
		setIsValidEmail( _value, index );
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

	function setIsDirtyEmail( value: string, index: number ) {
		const _isDirtyEmails = Array.from( isDirtyEmails );
		_isDirtyEmails[ index ] = !! value;
		setIsDirtyEmails( _isDirtyEmails );
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

	function onFileRemoveClick() {
		setSelectedFile( undefined );
		importCsvSubscribersUpdate( undefined );
	}

	function extendEmailFormControls() {
		const validEmailsNum = isValidEmails.filter( ( x ) => x ).length;
		const currentEmailFormControlsNum = emailFormControls.length;

		if (
			currentEmailFormControlsNum < emailControlMaxNum &&
			currentEmailFormControlsNum === validEmailsNum
		) {
			const controls = Array.from( emailFormControls );
			controls.push( __( 'Add another email' ) );

			setEmailFormControls( controls );
		}
	}

	function importFinishedRecognition() {
		! importSelector?.error && prevInProgress.current && ! inProgress && onImportFinished?.();
	}

	/**
	 * ↓ Templates
	 */
	return (
		<div className={ 'add-subscriber' }>
			<div className={ 'add-subscriber__title-container' }>
				{ showTitleEmoji && <h2 className={ 'add-subscriber__title-emoji' }>🤝</h2> }
				<Title>{ __( 'Add subscribers to build your audience' ) }</Title>
			</div>

			<div className={ 'add-subscriber__form--container' }>
				{ inProgress && (
					<Notice isDismissible={ false }>{ __( 'Your email list is being uploaded' ) }...</Notice>
				) }

				{ importSelector?.error && (
					<Notice isDismissible={ false } status={ 'error' }>
						{ importSelector.error.message as string }
					</Notice>
				) }

				<form onSubmit={ onFormSubmit } autoComplete={ 'off' }>
					{ emailFormControls.map( ( placeholder, i ) => {
						const showError = isDirtyEmails[ i ] && ! isValidEmails[ i ] && emails[ i ];

						return (
							<div key={ i }>
								<TextControl
									className={ showError ? 'is-error' : '' }
									disabled={ inProgress }
									placeholder={ placeholder }
									value={ emails[ i ] || '' }
									help={ isValidEmails[ i ] ? <Icon icon={ check } /> : undefined }
									onChange={ ( value ) => onEmailChange( value, i ) }
									onBlur={ () => setIsDirtyEmail( emails[ i ], i ) }
								/>

								{ showError && (
									<FormInputValidation
										isError={ true }
										text={ __( 'The format of the email is invalid' ) }
									/>
								) }
							</div>
						);
					} ) }

					{ emailControlMaxNum === isValidEmails.filter( ( x ) => x ).length && (
						<FormInputValidation icon={ 'tip' } isError={ false } isWarning={ true } text={ '' }>
							<Icon icon={ tip } />
							{ __(
								'Nice start there! If you have more subscribers to add, we’ll help you get them added later.'
							) }
						</FormInputValidation>
					) }

					{ ! isSelectedFileValid && (
						<FormInputValidation isError={ true } text={ '' }>
							{ createInterpolateElement(
								__(
									'Sorry, you can only upload CSV files right now. Most providers will let you export this from your settings. <uploadBtn>Select another file</uploadBtn>'
								),
								{ uploadBtn: formFileUploadElement }
							) }
						</FormInputValidation>
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
										onClick: onFileRemoveClick,
									} ),
								}
							) }
						</label>
					) }

					{ showCsvUpload && isSelectedFileValid && ! selectedFile && (
						<label>
							{ createInterpolateElement(
								__(
									'Or bring your mailing list from other newsletter services by <uploadBtn>uploading a CSV file.</uploadBtn>'
								),
								{ uploadBtn: formFileUploadElement }
							) }
						</label>
					) }

					{ showCsvUpload && isSelectedFileValid && selectedFile && (
						<p className={ 'add-subscriber__form--disclaimer' }>
							{ createInterpolateElement(
								__(
									'By clicking "continue", you represent that you\'ve obtained the appropriate consent to email each person on your list. <Button>Learn more</Button>'
								),
								{
									Button: createElement( Button, {
										isLink: true,
										target: '__blank',
										href: localizeUrl( 'https://wordpress.com/support/user-roles/' ),
									} ),
								}
							) }
						</p>
					) }

					<NextButton
						type={ 'submit' }
						className={ 'add-subscriber__form-submit-btn' }
						isBusy={ inProgress }
						disabled={ inProgress }
					>
						{ submitBtnName || __( 'Add subscribers' ) }
					</NextButton>
					{ showSkipBtn && (
						<SkipButton
							className={ 'add-subscriber__form-skip-btn' }
							onClick={ () => onSkipBtnClick?.() }
						>
							{ __( 'Not yet' ) }
						</SkipButton>
					) }
				</form>
			</div>
		</div>
	);
};
