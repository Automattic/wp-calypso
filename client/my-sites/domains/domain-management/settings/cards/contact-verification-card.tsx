import { Button } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { WhoisData } from '../types';

import './style.scss';

interface Props {
	contactInformation: WhoisData | undefined;
	contactInformationUpdateLink: string | undefined;
	selectedDomainName: string;
}

const ContactVerificationCard: FunctionComponent< Props > = ( props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ selectedFiles, setSelectedFiles ] = useState< FileList | null >( null );
	const [ submitting, setSubmitting ] = useState( false );
	const [ submitted, setSubmitted ] = useState( false );
	const [ error, setError ] = useState( false );

	const renderContactInformation = () => {
		const { contactInformation } = props;

		if ( ! contactInformation ) {
			return <div className="ownership-verification-card__contact-information-placeholder" />;
		}

		return (
			<div className="ownership-verification-card__contact-information">
				<p>
					{ contactInformation.fname } { contactInformation.lname }
				</p>
				{ contactInformation.org && <p>{ contactInformation.org }</p> }
				<p>{ contactInformation.email }</p>
				<p>{ contactInformation.sa1 }</p>
				{ contactInformation.sa2 && <p>{ contactInformation.sa2 }</p> }
				<p>
					{ contactInformation.city }
					{ contactInformation.sp && <span>, { contactInformation.sp }</span> }
					<span> { contactInformation.pc }</span>
				</p>
				<p>{ contactInformation.country_code }</p>
				<p>{ contactInformation.phone }</p>
				{ contactInformation.fax && <p>{ contactInformation.fax }</p> }
			</div>
		);
	};

	const renderDescription = () => {
		const { contactInformationUpdateLink } = props;

		return (
			<div>
				<p>
					{ translate(
						'Nominet, the organization that manages .uk domains, requires us to verify the contact information of your domain.'
					) }
				</p>
				<p>{ translate( 'This is your current contact information:' ) }</p>
				{ renderContactInformation() }
				<p>
					{ translate(
						'Please verify that the above information is correct and either {{a}}update it{{/a}} or provide a photo of a document on which the above name and address are clearly visible. Some of the accepted documents are:',
						{
							components: {
								a: contactInformationUpdateLink ? (
									<a href={ contactInformationUpdateLink } />
								) : (
									<span />
								),
							},
						}
					) }
				</p>
				<ul>
					<li>{ translate( "Valid drivers' license" ) }</li>
					<li>{ translate( 'Valid national ID cards (for non-UK residents)' ) }</li>
					<li>{ translate( 'Utility bills (last 3 months)' ) }</li>
					<li>{ translate( 'Bank statement (last 3 months)' ) }</li>
					<li>{ translate( 'HMRC tax notification (last 3 months)' ) }</li>
				</ul>
				<p>
					{ translate(
						'Click on the button below to upload up to three documents and then click on the "Submit" button. You can upload images (JPEG or PNG) and/or PDF files up to 5MB each.'
					) }
				</p>
			</div>
		);
	};

	const handleFilesSelected = ( files: FileList ) => {
		if ( files.length > 3 ) {
			dispatch( errorNotice( translate( 'You can only upload up to three documents.' ) ) );
			return;
		}

		setSelectedFiles( files );
		setError( false );
	};

	const renderSelectFilesButton = () => {
		return (
			<div>
				<FilePicker multiple accept="image/*,.pdf" onPick={ handleFilesSelected }>
					<Button disabled={ submitting || submitted }>{ translate( 'Select files' ) }</Button>
				</FilePicker>
			</div>
		);
	};

	const renderSelectedFileList = () => {
		if ( ! selectedFiles || selectedFiles.length === 0 ) {
			return <p>{ translate( 'No selected files yet' ) }</p>;
		}

		const fileList = [ ...selectedFiles ].map( ( file: File ) => (
			<li key={ file.name }>{ file.name }</li>
		) );
		return (
			<div className="ownership-verification-card__selected-files">
				<p>{ translate( 'Selected files:' ) }</p>
				<ul>{ fileList }</ul>
			</div>
		);
	};

	const submitFiles = () => {
		if ( ! selectedFiles || selectedFiles.length === 0 ) {
			setError( true );
			return;
		}

		setSubmitting( true );
		const formData: [ string, File, string ][] = [];
		[ ...selectedFiles ].forEach( ( file: File ) => {
			formData.push( [ 'files[]', file, file.name ] );
		} );

		wpcom.req.post(
			{
				path: `/domains/${ props.selectedDomainName }/contact-verification`,
				apiVersion: '1.1',
				formData,
			},
			( error: Error ) => {
				setSubmitting( false );

				if ( error ) {
					setError( true );
					dispatch( errorNotice( error.message ) );
					return;
				}

				setSubmitted( true );
				setError( false );
				dispatch(
					successNotice( translate( 'Documents submitted for verification succcesfully!' ) )
				);
			}
		);
	};

	const isSubmitFilesButtonDisabled = () => {
		return ! selectedFiles || selectedFiles.length === 0 || submitting || submitted;
	};

	const renderSubmitFilesButton = () => {
		return (
			<div>
				<Button
					onClick={ submitFiles }
					busy={ submitting }
					disabled={ isSubmitFilesButtonDisabled() }
					primary
				>
					{ translate( 'Submit' ) }
				</Button>
			</div>
		);
	};

	const renderSubmittedMessage = () => {
		return (
			<div className="ownership-verification-card__message">
				<Icon
					icon={ info }
					size={ 18 }
					className="ownership-verification-card__message-icon success"
					viewBox="2 2 20 20"
				/>
				<span className="ownership-verification-card__message-text">
					{ translate(
						'Thank you for submitting your documents for contact verification! If your domain was suspended, it may take up to a week for it to be unsuspended. Our support team will contact you via email if further actions are needed.'
					) }
				</span>
			</div>
		);
	};

	const renderErrorMessage = () => {
		return (
			<div className="ownership-verification-card__message">
				<Icon
					icon={ info }
					size={ 18 }
					className="ownership-verification-card__message-icon error"
					viewBox="2 2 20 20"
				/>
				<span className="ownership-verification-card__message-text">
					{ translate(
						'An error occurred when uploading your files. Please try submitting them again. If the error persists, please contact our support team.'
					) }
				</span>
			</div>
		);
	};

	return (
		<div className="ownership-verification-card">
			{ renderDescription() }
			{ renderSelectFilesButton() }
			{ renderSelectedFileList() }
			{ renderSubmitFilesButton() }
			{ submitted && renderSubmittedMessage() }
			{ error && renderErrorMessage() }
		</div>
	);
};

export default ContactVerificationCard;
