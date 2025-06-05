import { FormLabel } from '@automattic/components';
import { Button, SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, type ChangeEvent, useMemo, useEffect } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import FilePicker from 'calypso/components/file-picker';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useProvideGeneralFeedback } from '../hooks/use-provide-general-feedback';
import { FeedbackType, type GeneralFeedbackTextAreaTypes } from '../types';

import './style.scss';

export const PROVIDE_FEEDBACK_URL_HASH_FRAGMENT = '#provide-feedback';

export default function ProvideFeedback() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { submitGeneralFeedback, isSubmitting, isSuccess } = useProvideGeneralFeedback();

	const provideFeedbackHash = window.location.hash === PROVIDE_FEEDBACK_URL_HASH_FRAGMENT;

	const [ showProvideFeedbackForm, setShowProvideFeedbackForm ] = useState( provideFeedbackHash );

	const options: {
		label: string;
		value: FeedbackType;
		fields: {
			id: GeneralFeedbackTextAreaTypes;
			label: string;
			placeholder?: string;
			type: string;
			optional?: boolean;
		}[];
	}[] = useMemo(
		() => [
			{
				label: translate( 'General feedback' ),
				value: FeedbackType.GeneralFeedback,
				fields: [
					{
						id: 'improvements',
						label: translate( 'What can we improve within Automattic for Agencies?' ),
						placeholder: translate( 'Enter your thoughts' ),
						type: 'textarea',
					},
				],
			},
			{
				label: translate( 'Bug report' ),
				value: FeedbackType.BugReport,
				fields: [
					{
						id: 'issues',
						label: translate( 'What problem(s) did you find?' ),
						placeholder: translate( 'Enter the issues you encountered' ),
						type: 'textarea',
					},
					{
						id: 'location',
						label: translate( 'Where did you find the problem(s)?' ),
						placeholder: translate( 'Enter where you saw the problem' ),
						type: 'textarea',
					},
					{
						id: 'screenshot',
						label: translate( 'Upload a screenshot (Optional)' ),
						type: 'file',
						optional: true,
					},
				],
			},
			{
				label: translate( 'Suggest a feature' ),
				value: FeedbackType.SuggestAFeature,
				fields: [
					{
						id: 'feature',
						label: translate(
							'What would you like to see us improve within Automattic for Agencies?'
						),
						placeholder: translate( 'Enter the feature you want to see' ),
						type: 'textarea',
					},
					{
						id: 'inspiration',
						label: translate( 'Have you seen this elsewhere? If so, where?' ),
						placeholder: translate( 'Enter your inspiration' ),
						type: 'textarea',
					},
					{
						id: 'workflow',
						label: translate(
							'How important is this to you? Can you describe your ideal workflow?'
						),
						placeholder: translate( 'Enter your ideal workflow' ),
						type: 'textarea',
					},
				],
			},
		],
		[ translate ]
	);

	const [ feedbackType, setFeedbackType ] = useState< FeedbackType >( options[ 0 ].value );
	const [ feedbackFields, setFeedbackFields ] = useState< Record< string, string > >( {} );
	const [ screenshot, setScreenshot ] = useState< File | null >( null );
	const [ screenshotError, setScreenshotError ] = useState< string | null >( null );

	const handleFieldChange = useCallback( ( id: string, value: string ) => {
		setFeedbackFields( ( prevFields ) => ( { ...prevFields, [ id ]: value } ) );
	}, [] );

	const handleScreenshotChange = useCallback(
		( file: File | null ) => {
			// If the file size is greater than 50MB, set the error message.
			if ( file?.size && file.size > 50 * 1024 * 1024 ) {
				setScreenshot( null );
				setScreenshotError( translate( 'The image file size must be less than 50MB.' ) );
				return;
			}
			setScreenshotError( null );
			setScreenshot( file );
			dispatch( recordTracksEvent( 'calypso_a4a_provide_feedback_screenshot_added' ) );
		},
		[ dispatch, translate ]
	);
	const handleSetFeedbackType = useCallback(
		( value?: FeedbackType ) => {
			setFeedbackType( value ?? options[ 0 ].value );
			setFeedbackFields( {} );
			setScreenshot( null );
			if ( value ) {
				dispatch(
					recordTracksEvent( 'calypso_a4a_provide_feedback_type_selected', {
						feedback_type: value,
					} )
				);
			}
		},
		[ options, dispatch ]
	);

	const onCloseProvideFeedbackForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		handleSetFeedbackType();
		setShowProvideFeedbackForm( false );
	}, [ handleSetFeedbackType ] );

	// We need make sure to set this to true when we have the support form hash fragment.
	if ( provideFeedbackHash && ! showProvideFeedbackForm ) {
		setShowProvideFeedbackForm( true );
	}

	const currentFields = useMemo(
		() => options.find( ( option ) => option.value === feedbackType )?.fields || [],
		[ options, feedbackType ]
	);

	const handleSubmit = useCallback( () => {
		submitGeneralFeedback( {
			type: feedbackType as FeedbackType,
			responses: currentFields.reduce(
				( acc, field ) => ( {
					...acc,
					// Remove the screenshot from the responses if it exists.
					...( field.id !== 'screenshot' ? { [ field.id ]: feedbackFields[ field.id ] } : {} ),
				} ),
				{} as Record< string, string >
			),
			screenshot: screenshot || undefined,
		} );
	}, [ feedbackFields, feedbackType, currentFields, submitGeneralFeedback, screenshot ] );

	useEffect( () => {
		if ( isSuccess ) {
			onCloseProvideFeedbackForm();
		}
	}, [ isSuccess, onCloseProvideFeedbackForm ] );

	if ( ! showProvideFeedbackForm ) {
		return null;
	}

	// Disable the submit button if any of the current textarea fields are empty and not optional.
	const isDisabled = currentFields.some(
		( field ) => ! field?.optional && ! feedbackFields[ field.id ]
	);

	return (
		<A4AModal
			className="a4a-provide-feedback__modal"
			showCloseButton={ false }
			onClose={ onCloseProvideFeedbackForm }
			title={ translate( 'Provide feedback' ) }
			subtile={
				<>
					{ translate(
						'We want to hear from you! Use this form for general feedback to make the product better.'
					) }
					<br />
					{ translate( 'Need a reply? {{a}}Reach out to your partner manager{{/a}}.', {
						components: {
							a: (
								<a href={ CONTACT_URL_HASH_FRAGMENT }>
									{ translate( 'Reach out to your partner manager.' ) }
								</a>
							),
						},
					} ) }
				</>
			}
			extraActions={
				<Button
					variant="primary"
					onClick={ handleSubmit }
					disabled={ isSubmitting || isDisabled }
					isBusy={ isSubmitting }
				>
					{ translate( 'Submit' ) }
				</Button>
			}
		>
			<div className="a4a-provide-feedback__form">
				<SelectControl
					className="a4a-provide-feedback__form-select"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'What kind of feedback do you want to provide' ) }
					labelPosition="top"
					value={ feedbackType }
					options={ options.map( ( option ) => ( {
						label: option.label,
						value: option.value,
					} ) ) }
					onChange={ handleSetFeedbackType }
					disabled={ isSubmitting }
				></SelectControl>
				{ currentFields.map( ( field ) => (
					<FormFieldset key={ field.id } className="a4a-provide-feedback__form-fieldset">
						<FormLabel className="a4a-provide-feedback__form-label" htmlFor={ field.id }>
							{ field.label }
						</FormLabel>
						{ field.type === 'textarea' && (
							<FormTextarea
								className="a4a-provide-feedback__form-textarea"
								name={ field.id }
								id={ field.id }
								value={ feedbackFields[ field.id ] }
								placeholder={ field.placeholder }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
									handleFieldChange( field.id, event.target.value )
								}
								disabled={ isSubmitting }
							/>
						) }

						{ field.type === 'file' && (
							<>
								{ screenshot && (
									<div className="a4a-provide-feedback__form-file-container">
										<div className="a4a-provide-feedback__form-file-name">{ screenshot.name }</div>
										<Button
											size="small"
											variant="tertiary"
											onClick={ () => handleScreenshotChange( null ) }
										>
											{ translate( 'Remove' ) }
										</Button>
									</div>
								) }
								{ screenshotError && (
									<div className="a4a-provide-feedback__form-file-error">{ screenshotError }</div>
								) }
								<FilePicker
									accept="image/*"
									onPick={ ( files: FileList ) => handleScreenshotChange( files[ 0 ] ) }
								>
									<Button variant="secondary" disabled={ isSubmitting }>
										{ screenshot ? translate( 'Replace image' ) : translate( 'Select image' ) }
									</Button>
								</FilePicker>
								<div className="a4a-provide-feedback__form-file-instructions">
									{ translate( 'Upload any image up to 50MB in size.' ) }
								</div>
							</>
						) }
					</FormFieldset>
				) ) }
			</div>
		</A4AModal>
	);
}
