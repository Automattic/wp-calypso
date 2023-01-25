/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload, Button } from '@wordpress/components';
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
	isSiteOnFreePlan?: boolean;
	flowName?: string;
	showTitle?: boolean;
	showSubtitle?: boolean;
	showCsvUpload?: boolean;
	showFormManualListLabel?: boolean;
	submitBtnName?: string;
	submitBtnAlwaysEnable?: boolean;
	allowEmptyFormSubmit?: boolean;
	manualListEmailInviting?: boolean;
	recordTracksEvent?: RecordTrackEvents;
	onSkipBtnClick?: () => void;
	onImportFinished?: () => void;
}

export const AddSubscriberForm: FunctionComponent< Props > = ( props ) => {
	const __ = useTranslate();
	const HANDLED_ERROR = {
		IMPORT_LIMIT: 'subscriber_import_limit_reached',
		IMPORT_BLOCKED: 'blocked_import',
	};
	const {
		siteId,
		isSiteOnFreePlan,
		flowName,
		showTitle = true,
		showSubtitle,
		showCsvUpload,
		showFormManualListLabel,
		submitBtnName = __( 'Add subscribers' ),
		submitBtnAlwaysEnable,
		allowEmptyFormSubmit,
		manualListEmailInviting,
		recordTracksEvent,
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
	const emailControlMaxNum = 6;
	const emailControlPlaceholder = [
		__( 'sibling@example.com' ),
		__( 'parents@example.com' ),
		__( 'friend@example.com' ),
	];
	const inProgress = useInProgressState();
	const prevInProgress = useRef( inProgress );
	const prevSubmitAttemptCount = useRef< number >();
	const [ selectedFile, setSelectedFile ] = useState< File >();
	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( true );
	const [ emails, setEmails ] = useState< string[] >( [] );
	const [ isValidEmails, setIsValidEmails ] = useState< boolean[] >( [] );
	const [ isDirtyEmails, setIsDirtyEmails ] = useState< boolean[] >( [] );
	const [ emailFormControls, setEmailFormControls ] = useState( emailControlPlaceholder );
	const [ submitAttemptCount, setSubmitAttemptCount ] = useState( 0 );
	const [ submitBtnReady, setIsSubmitBtnReady ] = useState( isSubmitButtonReady() );
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
	useEffect( () => {
		prevSubmitAttemptCount.current = submitAttemptCount;
	}, [ submitAttemptCount ] );
	useEffect( () => {
		setIsSubmitBtnReady( isSubmitButtonReady() );
	}, [ isValidEmails, selectedFile, allowEmptyFormSubmit, submitBtnAlwaysEnable ] );

	useRecordAddFormEvents( recordTracksEvent, flowName );

	/**
	 * ↓ Functions
	 */
	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
		setSubmitAttemptCount( submitAttemptCount + 1 );

		const validEmails = getValidEmails();

		if ( manualListEmailInviting ) {
			// add subscribers with invite email
			validEmails.length && addSubscribers( siteId, validEmails );
			// import subscribers providing only CSV list of emails
			selectedFile && importCsvSubscribers( siteId, selectedFile );
		} else {
			// import subscribers proving CSV and manual list of emails
			( selectedFile || validEmails.length ) &&
				importCsvSubscribers( siteId, selectedFile, validEmails );
		}

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

	function getValidEmails(): string[] {
		return isValidEmails.map( ( x, i ) => x && emails[ i ] ).filter( ( x ) => !! x ) as string[];
	}

	function isValidExtension( fileName: string ) {
		const extensionRgx = new RegExp( /[^\\]*\.(?<extension>\w+)$/ );
		const validExtensions = [ 'csv' ];
		const match = extensionRgx.exec( fileName );

		return validExtensions.includes( match?.groups?.extension.toLowerCase() as string );
	}

	function onFileInputChange( e: ChangeEvent< HTMLInputElement > ) {
		const f = e.target.files;
		if ( ! f || ! f.length ) {
			return;
		}

		const file = f[ 0 ];
		const isValid = isValidExtension( file.name );

		setIsSelectedFileValid( isValid );
		isValid && setSelectedFile( file );
		importCsvSubscribersUpdate( undefined );
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

	function isSubmitButtonReady(): boolean {
		return (
			submitBtnAlwaysEnable ||
			!! allowEmptyFormSubmit ||
			!! getValidEmails().length ||
			!! selectedFile
		);
	}

	function resetFormState(): void {
		setEmails( [] );
		setSelectedFile( undefined );
		importCsvSubscribersUpdate( undefined );
		setIsSelectedFileValid( true );
		setIsValidEmails( [] );
		setIsDirtyEmails( [] );
	}

	function importFinishedRecognition() {
		if ( ! importSelector?.error && prevInProgress.current && ! inProgress ) {
			resetFormState();
			onImportFinished?.();
		}
	}

	function includesHandledError() {
		return Object.values( HANDLED_ERROR ).includes( importSelector?.error?.code as string );
	}

	/**
	 * ↓ Templates
	 */
	function renderImportErrorMsg() {
		const error = importSelector?.error;

		return (
			error && (
				<FormInputValidation icon="tip" isError={ false } isWarning={ true } text="">
					<Icon icon={ tip } />
					{ ( () => {
						switch ( error.code ) {
							case HANDLED_ERROR.IMPORT_LIMIT:
								return createInterpolateElement(
									__(
										'We couldn’t import your subscriber list as you’ve hit the 100 email limit for our free plan. The good news? You can upload a list of any size after upgrading to any paid plan. If you’d like to import a smaller list now, you can <uploadBtn>upload a different file</uploadBtn>.'
									),
									{ uploadBtn: formFileUploadElement }
								);

							case HANDLED_ERROR.IMPORT_BLOCKED:
								return __(
									'We ran into a security issue with your subscriber list. It’s nothing to worry about. If you reach out to our support team when you’ve finished setting things up, they’ll help resolve this for you.'
								);

							default:
								return error.message;
						}
					} )() }
				</FormInputValidation>
			)
		);
	}

	function renderFileValidationMsg() {
		return (
			! isSelectedFileValid && (
				<FormInputValidation isError={ true } text="">
					{ createInterpolateElement(
						__(
							'Sorry, you can only upload CSV files right now. Most providers will let you export this from your settings. <uploadBtn>Select another file</uploadBtn>'
						),
						{ uploadBtn: formFileUploadElement }
					) }
				</FormInputValidation>
			)
		);
	}

	function renderEmptyFormValidationMsg() {
		const validationMsg = showCsvUpload
			? __(
					'The required fields are manually entering at least one email ' +
						'or providing your mailing list by selecting a CSV file.'
			  )
			: __( 'The required field is to enter at least one email.' );

		return (
			!! submitAttemptCount &&
			submitAttemptCount !== prevSubmitAttemptCount.current &&
			! emails.filter( ( x ) => !! x ).length &&
			! selectedFile && <FormInputValidation isError={ true } text={ validationMsg } />
		);
	}

	function renderEmailListInfoMsg() {
		return (
			emailControlMaxNum === isValidEmails.filter( ( x ) => x ).length && (
				<FormInputValidation icon="tip" isError={ false } text="">
					<Icon icon={ tip } />
					{ __( 'Great start! You’ll be able to add more subscribers after setup.' ) }
				</FormInputValidation>
			)
		);
	}

	function renderImportCsvDisclaimerMsg() {
		return (
			( !! getValidEmails().length || ( isSelectedFileValid && selectedFile ) ) && (
				<p className="add-subscriber__form--disclaimer">
					{ createInterpolateElement(
						sprintf(
							/* translators: the first string variable shows CTA button name */
							__(
								'By clicking "%s", you represent that you\'ve obtained the appropriate consent to email each person. <Button>Learn more</Button>'
							),
							submitBtnName
						),
						{
							Button: createElement( Button, {
								isLink: true,
								target: '__blank',
								href: localizeUrl(
									'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/'
								),
							} ),
						}
					) }
				</p>
			)
		);
	}

	function renderImportCsvLabel() {
		const ariaLabelMsg = isSiteOnFreePlan
			? __(
					'Or bring your mailing list up to 100 emails from other newsletter services by uploading a CSV file.'
			  )
			: __( 'Or bring your mailing list from other newsletter services by uploading a CSV file.' );

		return (
			isSelectedFileValid &&
			! selectedFile && (
				<label aria-label={ ariaLabelMsg }>
					{ createInterpolateElement(
						isSiteOnFreePlan
							? __(
									'Or bring your mailing list up to 100 emails from other newsletter services by <uploadBtn>uploading a CSV file.</uploadBtn>'
							  )
							: __(
									'Or bring your mailing list from other newsletter services by <uploadBtn>uploading a CSV file.</uploadBtn>'
							  ),
						{ uploadBtn: formFileUploadElement }
					) }
				</label>
			)
		);
	}

	function renderImportCsvSelectedFileLabel() {
		return (
			isSelectedFileValid &&
			selectedFile && (
				<label className="add-subscriber__form-label-links">
					{ createInterpolateElement(
						sprintf(
							/* translators: the first string variable shows a selected file name, Replace and Remove are links */
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
			)
		);
	}

	function renderFollowerNoticeLabel() {
		return (
			isSelectedFileValid &&
			! selectedFile && (
				<label>
					{ __(
						"If you enter an email address that has a WordPress.com account, they'll become a follower."
					) }
				</label>
			)
		);
	}

	return (
		<div className="add-subscriber">
			{ ( showTitle || showSubtitle ) && (
				<div className="add-subscriber__title-container">
					{ showTitle && <Title>{ __( 'Let’s add your first subscribers' ) }</Title> }
					{ showSubtitle && (
						<SubTitle>
							{ __(
								'Your subscribers will receive an email notification whenever you publish a new post.'
							) }
						</SubTitle>
					) }
				</div>
			) }

			<div className="add-subscriber__form--container">
				<form onSubmit={ onFormSubmit } autoComplete="off">
					{ emailFormControls.map( ( placeholder, i ) => {
						const showError = isDirtyEmails[ i ] && ! isValidEmails[ i ] && emails[ i ];

						return (
							<div key={ i }>
								{ showFormManualListLabel && i === 0 && (
									<label className="add-subscriber__form-label-emails">
										<strong>{ __( 'Emails' ) }</strong>
									</label>
								) }
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

					{ renderEmailListInfoMsg() }
					{ renderFileValidationMsg() }
					{ renderImportErrorMsg() }

					{ ! includesHandledError() && renderImportCsvSelectedFileLabel() }
					{ showCsvUpload && ! includesHandledError() && renderImportCsvLabel() }
					{ showCsvUpload && ! includesHandledError() && renderImportCsvDisclaimerMsg() }
					{ ! includesHandledError() && renderFollowerNoticeLabel() }

					{ renderEmptyFormValidationMsg() }

					<NextButton
						type="submit"
						className="add-subscriber__form-submit-btn"
						isBusy={ inProgress }
						disabled={ ! submitBtnReady }
					>
						{ submitBtnName }
					</NextButton>
				</form>
			</div>
		</div>
	);
};
