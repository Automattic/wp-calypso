/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { DropZone, FormFileUpload, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, FormEvent, FunctionComponent, useState, useEffect, useRef } from 'react';
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
	disabled?: boolean;
	hidden?: boolean;
	renderLearnMoreLink?: () => React.ReactNode;
}

export const UploadSubscribersForm: FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const HANDLED_ERROR = {
		IMPORT_LIMIT: 'subscriber_import_limit_reached',
		IMPORT_BLOCKED: 'blocked_import',
	};
	const {
		siteId,
		flowName,
		showTitle = true,
		showSubtitle,
		recordTracksEvent,
		onImportStarted,
		onImportFinished,
		onChangeIsImportValid,
		titleText,
		subtitleText,
		hidden,
		disabled,
		renderLearnMoreLink,
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

	const formFileUploadElement = <a href="./" />;

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

	const onFileSelect = useCallback( ( files: FileList | Array< File > ) => {
		if ( ! files || ! files.length ) {
			return;
		}

		const file = files[ 0 ];
		const isValid = isValidExtension( file.name );

		setIsSelectedFileValid( isValid );
		isValid && setSelectedFile( file );
		importCsvSubscribersUpdate( undefined );
	}, [] );

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
		const validationMsg = __(
			"You'll need to upload a CSV file of current subscribers to continue."
		);

		return (
			!! submitAttemptCount &&
			submitAttemptCount !== prevSubmitAttemptCount.current &&
			! selectedFile && <FormInputValidation isError text={ validationMsg } />
		);
	}

	if ( hidden ) {
		return null;
	}

	return (
		<div className="add-subscriber">
			{ ( showTitle || showSubtitle ) && (
				<div className="add-subscriber__title-container">
					{ showTitle && <Title>{ titleText ?? __( 'Let’s add your first subscribers' ) }</Title> }
					{ showSubtitle && (
						<SubTitle>
							{ subtitleText ??
								__(
									'Your subscribers will receive an email notification whenever you publish a new post.'
								) }
						</SubTitle>
					) }
				</div>
			) }

			<div className="add-subscriber__form--container">
				<p>
					{ createInterpolateElement(
						__(
							'Upload a CSV file with your existing subscribers list from platforms like <BeehiivLink>Beehiiv</BeehiivLink>, <GhostLink>Ghost</GhostLink>, <KitLink>Kit</KitLink>, <MailChimpLink>MailChimp</MailChimpLink>, <MediumLink>Medium</MediumLink>, <PatreonLink>Patreon</PatreonLink>, and many others.'
						),
						{
							BeehiivLink: (
								<a
									href="https://www.beehiiv.com/support/article/12234988536215-how-to-export-subscribers"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							GhostLink: (
								<a
									href="https://ghost.org/help/exports/#members"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							KitLink: (
								<a
									href="https://help.kit.com/en/articles/2502489-how-to-export-subscribers-in-kit"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							MailChimpLink: (
								<a
									href="https://mailchimp.com/help/view-export-contacts/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							MediumLink: (
								<a
									href="https://help.medium.com/hc/en-us/articles/360059837393-Email-subscriptions"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							PatreonLink: (
								<a
									href="https://support.patreon.com/hc/en-gb/articles/360004385971-How-do-I-manage-my-members#h_01EQGYDNF2J3XR12ABBMTZPSQM"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						}
					) }
				</p>
				<form onSubmit={ onFormSubmit } autoComplete="off" className="subscriber-upload-form">
					{ renderFileValidationMsg() }
					{ renderImportErrorMsg() }
					{ renderEmptyFormValidationMsg() }

					{ ! isSelectedFileValid && selectedFile && (
						<FormInputValidation className="is-file-validation" isError text="">
							{ __( 'Sorry, you can only upload CSV files. Please try again with a valid file.' ) }
						</FormInputValidation>
					) }
					<div className="subscriber-upload-form__dropzone">
						<DropZone onFilesDrop={ onFileSelect } />
						<VStack alignment="center" justify="center">
							<FormFileUpload
								accept="text/csv"
								onChange={ ( event ) => {
									onFileSelect( event.currentTarget?.files || [] );
								} }
								multiple={ false }
							>
								<VStack direction="column" alignment="center" justify="center">
									<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
									{ ! selectedFile && (
										<p>{ __( 'Drag a file here, or click to upload a file' ) }</p>
									) }
									{ selectedFile && (
										<p>
											{ createInterpolateElement(
												sprintf(
													// translators: %s is a file name, e.g. example.csv
													__(
														'To replace this <fileName>%s</fileName> drag a file, or click to upload different one.'
													),
													selectedFile?.name || '-'
												),
												{
													fileName: <em />,
												}
											) }
										</p>
									) }
								</VStack>
							</FormFileUpload>
						</VStack>
					</div>

					{ isSelectedFileValid && selectedFile && ! includesHandledError() && (
						<p className="add-subscriber__form--disclaimer">
							{ __(
								'By clicking "Add Subscribers," you represent that you\'ve obtained the appropriate consent to email each person.'
							) }{ ' ' }
							{ renderLearnMoreLink && renderLearnMoreLink() }
						</p>
					) }

					<NextButton
						type="submit"
						className="add-subscriber__form-submit-btn"
						isBusy={ inProgress && ! disabled }
						disabled={ ! selectedFile || disabled }
					>
						{ __( 'Add subscribers' ) }
					</NextButton>
				</form>
			</div>
		</div>
	);
};
