/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import {
	ChangeEvent,
	FormEvent,
	FunctionComponent,
	useState,
	useEffect,
	useRef,
	useCallback,
} from 'react';
import { useActiveJobRecognition } from '../../hooks/use-active-job-recognition';
import { useInProgressState } from '../../hooks/use-in-progress-state';
import { RecordTrackEvents, useRecordAddFormEvents } from '../../hooks/use-record-add-form-events';
import { tip } from './icon';

import './style.scss';

interface Props {
	siteId: number;
	hasSubscriberLimit?: boolean;
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
	onImportStarted?: ( hasFile: boolean ) => void;
	onImportFinished?: () => void;
	onChangeIsImportValid?: ( isValid: boolean ) => void;
	titleText?: string;
	subtitleText?: string;
	showSkipLink?: boolean;
	hidden?: boolean;
	isWPCOMSite?: boolean;
	disabled?: boolean;
}

export const AddSubscriberForm: FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const HANDLED_ERROR = {
		IMPORT_LIMIT: 'subscriber_import_limit_reached',
		IMPORT_BLOCKED: 'blocked_import',
	};
	const {
		siteId,
		hasSubscriberLimit,
		flowName,
		showTitle = true,
		showSubtitle,
		showCsvUpload,
		showFormManualListLabel,
		submitBtnName = translate( 'Add subscribers' ),
		submitBtnAlwaysEnable,
		allowEmptyFormSubmit,
		manualListEmailInviting,
		recordTracksEvent,
		onImportStarted,
		onImportFinished,
		onChangeIsImportValid,
		onSkipBtnClick,
		titleText,
		subtitleText,
		showSkipLink,
		hidden = false,
		isWPCOMSite = false,
		disabled,
	} = props;

	const {
		addSubscribers,
		importCsvSubscribers,
		importCsvSubscribersUpdate,
		getSubscribersImports,
	} = useDispatch( Subscriber.store );

	/**
	 * ↓ Fields
	 */
	const emailControlMaxNum = 6;
	const emailControlPlaceholder = [
		translate( 'bestie@email.com' ),
		translate( 'chrisfromwork@email.com' ),
		translate( 'family@email.com' ),
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

	const importSelector = useSelect(
		( select ) => select( Subscriber.store ).getImportSubscribersSelector(),
		[]
	);
	const [ formFileUploadElement ] = useState(
		createElement( FormFileUpload, {
			name: 'import',
			onChange: onFileInputChange,
			disabled: inProgress || disabled,
		} )
	);

	const getValidEmails = useCallback( () => {
		return isValidEmails.map( ( x, i ) => x && emails[ i ] ).filter( ( x ) => !! x ) as string[];
	}, [ isValidEmails, emails ] );

	// This useState call has been moved below getValidEmails() to resolve
	// an error with calling getValidEmails() before it is initialized.
	// The next line calls isSubmitButtonReady() which invokes getValidEmails()
	// if submitBtnAlwaysEnable and allowEmptyFormSubmit are both false.
	const [ submitBtnReady, setIsSubmitBtnReady ] = useState( isSubmitButtonReady() );

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

	useEffect( () => {
		if ( !! getValidEmails().length || ( isSelectedFileValid && selectedFile ) ) {
			onChangeIsImportValid && onChangeIsImportValid( true );
		} else {
			onChangeIsImportValid && onChangeIsImportValid( false );
		}
	}, [ getValidEmails, isSelectedFileValid, selectedFile, onChangeIsImportValid ] );

	useRecordAddFormEvents( recordTracksEvent, flowName );

	/**
	 * ↓ Functions
	 */
	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
		setSubmitAttemptCount( submitAttemptCount + 1 );
		onImportStarted?.( !! selectedFile );

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
			controls.push( translate( 'Add another email' ) );

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
				<FormInputValidation icon="tip" isError={ false } isWarning text="">
					<Icon icon={ tip } />
					{ ( (): React.ReactNode => {
						switch ( error.code ) {
							case HANDLED_ERROR.IMPORT_LIMIT:
								return createInterpolateElement(
									translate(
										'We couldn’t import your subscriber list as you’ve hit the 100 email limit for our free plan. The good news? You can upload a list of any size after upgrading to any paid plan. If you’d like to import a smaller list now, you can <uploadBtn>upload a different file</uploadBtn>.'
									),
									{ uploadBtn: formFileUploadElement }
								);

							case HANDLED_ERROR.IMPORT_BLOCKED:
								return translate(
									'We ran into a security issue with your subscriber list. It’s nothing to worry about. If you reach out to our support team when you’ve finished setting things up, they’ll help resolve this for you.'
								);

							default:
								return typeof error.message === 'string' ? error.message : '';
						}
					} )() }
				</FormInputValidation>
			)
		);
	}

	function renderFileValidationMsg() {
		return (
			! isSelectedFileValid && (
				<FormInputValidation className="is-file-validation" isError text="">
					{ createInterpolateElement(
						translate(
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
			? translate(
					"You'll need to add at least one email address " +
						'or upload a CSV file of current subscribers to continue.'
			  )
			: translate( "You'll need to add at least one subscriber to continue." );

		return (
			!! submitAttemptCount &&
			submitAttemptCount !== prevSubmitAttemptCount.current &&
			! emails.filter( ( x ) => !! x ).length &&
			! selectedFile && <FormInputValidation isError text={ validationMsg } />
		);
	}

	function renderEmailListInfoMsg() {
		return (
			emailControlMaxNum === isValidEmails.filter( ( x ) => x ).length && (
				<FormInputValidation icon="tip" isError={ false } text="">
					<Icon icon={ tip } />
					{ translate( 'Great start! You’ll be able to add more subscribers after setup.' ) }
				</FormInputValidation>
			)
		);
	}

	function renderImportCsvDisclaimerMsg() {
		const importSubscribersUrl = ! isWPCOMSite
			? 'https://jetpack.com/support/newsletter/import-subscribers/'
			: 'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/';

		return (
			( !! getValidEmails().length || ( isSelectedFileValid && selectedFile ) ) && (
				<p className="add-subscriber__form--disclaimer">
					{ createInterpolateElement(
						sprintf(
							/* translators: the first string variable shows CTA button name */
							translate(
								'By clicking "%s," you represent that you\'ve obtained the appropriate consent to email each person. <Button>Learn more</Button>.'
							),
							submitBtnName
						),
						{
							Button: (
								<Button
									variant="link"
									target="_blank"
									href={ localizeUrl( importSubscribersUrl ) }
								/>
							),
						}
					) }
				</p>
			)
		);
	}

	function renderImportCsvLabel() {
		const ariaLabelMsg = hasSubscriberLimit
			? translate( 'Or upload a CSV file of up to 100 emails from your existing list. Learn more.' )
			: translate( 'Or upload a CSV file of emails from your existing list. Learn more.' );

		const importSubscribersUrl = ! isWPCOMSite
			? 'https://jetpack.com/support/newsletter/import-subscribers/'
			: 'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/';

		const interpolateElement = {
			uploadBtn: formFileUploadElement,
			Button: (
				<Button
					variant="link"
					target="_blank"
					rel="noreferrer"
					href={ localizeUrl( importSubscribersUrl ) }
				/>
			),
		};

		const labelText = hasSubscriberLimit
			? createInterpolateElement(
					translate(
						'Or <uploadBtn>upload a CSV file</uploadBtn> of up to 100 emails from your existing list. <Button>Learn more</Button>.'
					),
					interpolateElement
			  )
			: createInterpolateElement(
					translate(
						'Or <uploadBtn>upload a CSV file</uploadBtn> of emails from your existing list. <Button>Learn more</Button>.'
					),
					interpolateElement
			  );

		return (
			isSelectedFileValid &&
			! selectedFile && (
				<div aria-label={ ariaLabelMsg } className="add-subscriber__form--disclaimer">
					{ labelText }
				</div>
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
							translate(
								'<strong>%s</strong> <uploadBtn>Replace</uploadBtn> | <removeBtn>Remove</removeBtn>'
							),
							selectedFile?.name
						),
						{
							strong: createElement( 'strong' ),
							uploadBtn: formFileUploadElement,
							removeBtn: <Button variant="link" onClick={ onFileRemoveClick } />,
						}
					) }
				</label>
			)
		);
	}

	if ( hidden ) {
		return null;
	}

	return (
		<div className="add-subscriber">
			{ ( showTitle || showSubtitle ) && (
				<div className="add-subscriber__title-container">
					{ showTitle && (
						<Title>{ titleText ?? translate( 'Let’s add your first subscribers' ) }</Title>
					) }
					{ showSubtitle && (
						<SubTitle>
							{ subtitleText ??
								translate(
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
										<strong>{ translate( 'Emails' ) }</strong>
									</label>
								) }
								<TextControl
									className={ showError ? 'is-error' : '' }
									disabled={ inProgress || disabled }
									placeholder={ placeholder }
									value={ emails[ i ] || '' }
									help={ isValidEmails[ i ] ? <Icon icon={ check } /> : undefined }
									onChange={ ( value: string ) => onEmailChange( value, i ) }
									onBlur={ () => setIsDirtyEmail( emails[ i ], i ) }
								/>

								{ showError && (
									<FormInputValidation
										isError
										text={ translate( 'The format of the email is invalid' ) }
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

					{ renderEmptyFormValidationMsg() }

					{ showCsvUpload && ! includesHandledError() && renderImportCsvDisclaimerMsg() }

					<NextButton
						type="submit"
						className="add-subscriber__form-submit-btn"
						isBusy={ inProgress && ! disabled }
						disabled={ ! submitBtnReady || disabled }
					>
						{ submitBtnName }
					</NextButton>
					{ showSkipLink && (
						<div className="add-subscriber__form-skip-link-wrapper">
							<button className="add-subscriber__form-skip-link" onClick={ onSkipBtnClick }>
								{ translate( 'Skip for now' ) }
							</button>
						</div>
					) }
				</form>
			</div>
		</div>
	);
};
