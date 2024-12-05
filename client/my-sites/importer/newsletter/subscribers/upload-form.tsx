import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { ProgressBar, ExternalLink } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, cloudUpload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState, FormEvent, useEffect } from 'react';
import DropZone from 'calypso/components/drop-zone';
import FilePicker from 'calypso/components/file-picker';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../importer-action-buttons/container';
import ImportSubscribersError from './import-subscribers-error';

type Props = {
	nextStepUrl: string;
	siteId: number;
	skipNextStep: () => void;
	cardData: any;
};

export default function SubscriberUploadForm( { nextStepUrl, siteId, skipNextStep }: Props ) {
	const { __ } = useI18n();
	const [ selectedFile, setSelectedFile ] = useState< File >();

	const [ hasImportError, setHasImportError ] = useState( false );

	const { importCsvSubscribers, importCsvSubscribersUpdate } = useDispatch( Subscriber.store );
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );

		return {
			importSelector: subscriber.getImportSubscribersSelector(),
			imports: subscriber.getImportJobsSelector(),
		};
	}, [] );

	useEffect( () => {
		if ( importSelector?.error ) {
			setHasImportError( true );
		}
	}, [ importSelector ] );

	const [ isSelectedFileValid, setIsSelectedFileValid ] = useState( false );
	const onSubmit = useCallback(
		async ( event: FormEvent< HTMLFormElement > ) => {
			event.preventDefault();
			selectedFile && importCsvSubscribers( siteId, selectedFile, [], true );
		},
		[ selectedFile, importCsvSubscribers, siteId ]
	);
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const onFileSelect = useCallback( ( files: Array< File > ) => {
		const file = files[ 0 ];
		const isValid = isValidExtension( file.name );
		setHasImportError( false );
		setIsSelectedFileValid( isValid );
		isValid && setSelectedFile( file );
	}, [] );

	function isValidExtension( fileName: string ) {
		const extensionRgx = new RegExp( /[^\\]*\.(?<extension>\w+)$/ );
		const validExtensions = [ 'csv' ];
		const match = extensionRgx.exec( fileName );

		return validExtensions.includes( match?.groups?.extension.toLowerCase() as string );
	}

	// This fixes the issue of the form being the the upload state even if the user hasn't loaded the importer.
	useEffect( () => {
		importCsvSubscribersUpdate( undefined ); // reset the form.
	}, [ importCsvSubscribersUpdate ] );

	if ( importSelector?.inProgress ) {
		return (
			<div className="subscriber-upload-form__dropzone">
				<div className="subscriber-upload-form__in-progress">
					<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
					<p>{ __( 'Uploading…' ) }</p>
					<ProgressBar className="is-larger-progress-bar" />
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={ onSubmit } autoComplete="off" className="subscriber-upload-form">
			{ ! isSelectedFileValid && selectedFile && (
				<FormInputValidation className="is-file-validation" isError text="">
					{ __( 'Sorry, you can only upload CSV files. Please try again with a valid file.' ) }
				</FormInputValidation>
			) }
			<div className="subscriber-upload-form__dropzone">
				<DropZone onFilesDrop={ onFileSelect } />
				<FilePicker accept="text/csv" onPick={ onFileSelect } multiple={ false }>
					<Icon icon={ cloudUpload } viewBox="4 4 16 16" size={ 16 } />
					{ ! selectedFile && <p>{ __( 'Drag a file here, or click to upload a file' ) }</p> }
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
									fileName: <em className="file-name" />,
								}
							) }
						</p>
					) }
				</FilePicker>
			</div>

			{ isSelectedFileValid && selectedFile && ! hasImportError && (
				<p>
					{ createInterpolateElement(
						__(
							'By clicking "Continue," you represent that you\'ve obtained the appropriate consent to email each person. <learnMoreLink>Learn more</learnMoreLink>.'
						),
						{
							learnMoreLink: isJetpack ? (
								// @ts-expect-error Used in createInterpolateElement doesn't need children.
								<ExternalLink href="https://jetpack.com/support/newsletter/import-subscribers/" />
							) : (
								<InlineSupportLink
									showIcon={ false }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/import-subscribers-to-a-newsletter/'
									) }
									supportPostId={ 220199 }
								/>
							),
						}
					) }
				</p>
			) }

			{ hasImportError && importSelector?.error && (
				<ImportSubscribersError error={ importSelector?.error } />
			) }

			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					type="submit"
					primary
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_add_subscriber' );
					} }
					disabled={ ! ( isSelectedFileValid && selectedFile ) || hasImportError }
				>
					{ __( 'Continue' ) }
				</ImporterActionButton>
				<ImporterActionButton
					href={ nextStepUrl }
					onClick={ () => {
						skipNextStep();
						recordTracksEvent( 'calypso_paid_importer_connect_stripe_skipped' );
					} }
				>
					{ __( 'Skip for now' ) }
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</form>
	);
}
