import { domainWhoisQuery, domainContactVerificationMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
	FormFileUpload,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainContactInfoRoute, domainRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { findRegistrantWhois } from '../../utils/domain';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function DomainContactVerification() {
	const { domainName } = domainRoute.useParams();
	const [ selectedFiles, setSelectedFiles ] = useState< FileList | null >( null );
	const { data: domainWhois } = useSuspenseQuery( domainWhoisQuery( domainName ) );
	const registrantWhoisData = findRegistrantWhois( domainWhois );
	const [ submitted, setSubmitted ] = useState( false );
	const [ error, setError ] = useState( false );
	const { mutate: domainContactVerification, isPending: isSubmitting } = useMutation(
		domainContactVerificationMutation( domainName )
	);
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

	if ( ! registrantWhoisData ) {
		return null;
	}

	const handleFilesSelected = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const files = event.currentTarget.files;
		if ( ! files ) {
			setSelectedFiles( null );
			return;
		}

		if ( files.length > 3 ) {
			createErrorNotice( __( 'You can only upload up to three documents.' ), { type: 'snackbar' } );
			setSelectedFiles( null );
			return;
		}

		const oversizedFiles = [ ...files ].filter( ( file: File ) => file.size > MAX_FILE_SIZE );
		if ( oversizedFiles.length > 0 ) {
			createErrorNotice( __( 'Files must be under 5MB each.' ), { type: 'snackbar' } );
			setSelectedFiles( null );
			return;
		}

		setSelectedFiles( files );
	};

	const renderSelectedFileList = () => {
		if ( ! selectedFiles || selectedFiles.length === 0 ) {
			return <Text variant="muted">{ __( 'No selected files yet' ) }</Text>;
		}

		const fileList = [ ...selectedFiles ].map( ( file: File ) => (
			<li key={ file.name }>{ file.name }</li>
		) );
		return (
			<>
				<Text as="p">{ __( 'Selected files:' ) }</Text>
				<ul>{ fileList }</ul>
			</>
		);
	};

	const submitFiles = () => {
		if ( ! selectedFiles || selectedFiles.length === 0 ) {
			createErrorNotice( __( 'Please select at least one file.' ), { type: 'snackbar' } );
			return;
		}

		const formData: [ string, File, string ][] = [];
		[ ...selectedFiles ].forEach( ( file: File ) => {
			formData.push( [ 'files[]', file, file.name ] );
		} );
		domainContactVerification( formData, {
			onSuccess: () => {
				createSuccessNotice( __( 'Files submitted successfully.' ), { type: 'snackbar' } );
				setSubmitted( true );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to submit files.' ), { type: 'snackbar' } );
				setError( true );
			},
		} );
	};

	const renderSubmittedMessage = () => {
		return (
			<Notice variant="success">
				{ __(
					'Thank you for submitting your documents for contact verification! If your domain was suspended, it may take up to a week for it to be unsuspended. Our support team will contact you via email if further actions are needed.'
				) }
			</Notice>
		);
	};

	const renderErrorMessage = () => {
		return (
			<Notice variant="error">
				{ __(
					'An error occurred when uploading your files. Please try submitting them again. If the error persists, please contact our support team.'
				) }
			</Notice>
		);
	};

	const renderInstructions = () => {
		return (
			<>
				<Text as="p">
					{ createInterpolateElement(
						__(
							'Please verify that the above information is correct and either <link>update</link> it or provide a photo of a document on which the above name and address are clearly visible. Some of the accepted documents are:'
						),
						{
							link: (
								<RouterLinkButton
									variant="link"
									to={ domainContactInfoRoute.fullPath }
									params={ { domainName } }
								/>
							),
						}
					) }
				</Text>
				<ul>
					<li>{ __( "Valid drivers' license" ) }</li>
					<li>{ __( 'Valid national ID cards (for non-UK residents)' ) }</li>
					<li>{ __( 'Utility bills (last 3 months)' ) }</li>
					<li>{ __( 'Bank statement (last 3 months)' ) }</li>
					<li>{ __( 'HMRC tax notification (last 3 months)' ) }</li>
				</ul>
				<Text>
					{ __(
						'Please upload a photo of the document on which the above name and address are clearly visible.'
					) }
				</Text>
			</>
		);
	};

	const renderContactInformation = () => {
		return (
			<>
				<Text as="p">{ __( 'This is your current contact information:' ) }</Text>
				<VStack style={ { backgroundColor: '#f0f0f0', padding: '16px' } } spacing={ 1 }>
					<Text as="p">
						{ registrantWhoisData.fname } { registrantWhoisData.lname }
					</Text>
					{ registrantWhoisData.org && <Text>{ registrantWhoisData.org }</Text> }
					<Text as="p">{ registrantWhoisData.email }</Text>
					<Text as="p">{ registrantWhoisData.sa1 }</Text>
					{ registrantWhoisData.sa2 && <Text>{ registrantWhoisData.sa2 }</Text> }
					<Text as="p">
						{ registrantWhoisData.city }
						{ registrantWhoisData.sp && <span>, { registrantWhoisData.sp }</span> }
						<span> { registrantWhoisData.pc }</span>
					</Text>
					<Text as="p">{ registrantWhoisData.country_code }</Text>
					<Text as="p">{ registrantWhoisData.phone }</Text>
					{ registrantWhoisData.fax && <Text>{ registrantWhoisData.fax }</Text> }
				</VStack>
			</>
		);
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Contact Verification' ) } /> }>
			{ submitted && renderSubmittedMessage() }
			{ error && renderErrorMessage() }
			<Card>
				<CardBody>
					<VStack spacing={ 3 }>
						<SectionHeader
							title={ __( 'Additional contact verification required for your domain' ) }
							level={ 3 }
						/>
						<Text as="p">
							{ __(
								'Nominet, the organization that manages .uk domains, requires us to verify the contact information of your domain.'
							) }
						</Text>
						{ renderContactInformation() }
						{ renderInstructions() }
						<FormFileUpload
							accept="image/*,.pdf"
							multiple
							onChange={ handleFilesSelected }
							disabled={ isSubmitting }
							render={ ( { openFileDialog } ) => (
								<Button variant="secondary" __next40pxDefaultSize onClick={ openFileDialog }>
									{ __( 'Select files' ) }
								</Button>
							) }
						/>
						{ renderSelectedFileList() }
						<HStack>
							<Button
								variant="primary"
								__next40pxDefaultSize
								disabled={ ! selectedFiles || selectedFiles.length === 0 || isSubmitting }
								isBusy={ isSubmitting }
								onClick={ submitFiles }
							>
								{ __( 'Submit' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
