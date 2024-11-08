/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { FormFileUpload, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, FormEvent, FunctionComponent, useState, useEffect, useRef } from 'react';
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

export const UploadSubscribersForm: FunctionComponent< Props > = ( props ) => {
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

	const { importCsvSubscribersUpdate, getSubscribersImports } = useDispatch( Subscriber.store );

	/**
	 * ↓ Fields
	 */
	const inProgress = useInProgressState();
	const prevInProgress = useRef( inProgress );
	const prevSubmitAttemptCount = useRef< number >();
	const [ selectedFile, setSelectedFile ] = useState< File >();
	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( true );
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

	/**
	 * ↓ Effects
	 */
	// get initial list of jobs
	useEffect( () => {
		getSubscribersImports( siteId );
	}, [] );
	// run active job recognition process which updates state
	useActiveJobRecognition( siteId );
	useEffect( importFinishedRecognition );

	useEffect( () => {
		prevInProgress.current = inProgress;
	}, [ inProgress ] );

	useEffect( () => {
		prevSubmitAttemptCount.current = submitAttemptCount;
	}, [ submitAttemptCount ] );

	useEffect( () => {
		if ( isSelectedFileValid && selectedFile ) {
			onChangeIsImportValid && onChangeIsImportValid( true );
		} else {
			onChangeIsImportValid && onChangeIsImportValid( false );
		}
	}, [ isSelectedFileValid, selectedFile, onChangeIsImportValid ] );

	useRecordAddFormEvents( recordTracksEvent, flowName );

	/**
	 * ↓ Functions
	 */
	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
		setSubmitAttemptCount( submitAttemptCount + 1 );
		onImportStarted?.( !! selectedFile );

		/*
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
		*/
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

	function resetFormState(): void {
		setSelectedFile( undefined );
		importCsvSubscribersUpdate( undefined );
		setIsSelectedFileValid( true );
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
			! selectedFile && <FormInputValidation isError text={ validationMsg } />
		);
	}

	function renderImportCsvDisclaimerMsg() {
		const importSubscribersUrl = ! isWPCOMSite
			? 'https://jetpack.com/support/newsletter/import-subscribers/'
			: 'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/';

		return (
			isSelectedFileValid &&
			selectedFile && (
				<p className="add-subscriber__form--disclaimer">
					{ createInterpolateElement(
						translate(
							'By clicking "Add subscribers" you represent that you\'ve obtained the appropriate consent to email each person. <Button>Learn more</Button>.'
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
				<p>
					{ translate(
						'Upload a CSV file with your existing subscribers list from platforms like {{BeehiivLink}}Beehiiv{{/BeehiivLink}}, {{GhostLink}}Ghost{{/GhostLink}}, {{KitLink}}Kit{{/KitLink}}, {{MailChimpLink}}MailChimp{{/MailChimpLink}}, {{MediumLink}}Medium{{/MediumLink}}, {{PatreonLink}}Patreon{{/PatreonLink}}, and many others.',
						{
							components: {
								BeehiivLink: (
									<a href="https://www.beehiiv.com/" target="_blank" rel="noopener noreferrer" />
								),
								GhostLink: (
									<a href="https://ghost.org/" target="_blank" rel="noopener noreferrer" />
								),
								KitLink: <a href="https://kit.com/" target="_blank" rel="noopener noreferrer" />,
								MailChimpLink: (
									<a href="https://mailchimp.com/" target="_blank" rel="noopener noreferrer" />
								),
								MediumLink: (
									<a href="https://medium.com/" target="_blank" rel="noopener noreferrer" />
								),
								PatreonLink: (
									<a href="https://patreon.com/" target="_blank" rel="noopener noreferrer" />
								),
							},
						}
					) }
				</p>
				<form onSubmit={ onFormSubmit } autoComplete="off">
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
						disabled={ ! selectedFile || disabled }
					>
						{ translate( 'Add subscribers' ) }
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
