import { Button, TextareaControl, __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf, _n } from '@wordpress/i18n';
import { arrowRight } from '@wordpress/icons';
import { isAppleOS } from '@wordpress/keycodes';
import { useRef, useState, type ReactNode } from 'react';
import { Choice } from './choices';
import IntakeIllustration from './intake-illustration';
import { readSiteFile } from './site-intake';
import useGrowingSiteInput from './use-growing-site-input';

export default function SiteIntake( {
	describedBy,
	value,
	onChange,
	onReview,
	onError,
	error,
	onChooseAccount,
	compact,
	footer,
}: {
	describedBy?: string;
	value: string;
	onChange: ( value: string ) => void;
	onReview: ( value: string ) => void;
	onError: ( message: string ) => void;
	error: string;
	onChooseAccount?: () => void;
	compact?: boolean;
	footer?: ReactNode;
} ) {
	const fileInput = useRef< HTMLInputElement >( null );
	const [ reading, setReading ] = useState( false );
	const [ fileName, setFileName ] = useState( '' );
	const { input, isList, insertLine } = useGrowingSiteInput( value, onChange );
	const read = async ( file: File ) => {
		setReading( true );
		onError( '' );
		try {
			const text = await readSiteFile( file );
			onChange( value ? `${ value }\n${ text }` : text );
			setFileName( file.name );
		} catch ( error ) {
			onError(
				error instanceof Error && error.message === 'file-too-large'
					? __( 'Choose a file smaller than 5 MB.' )
					: __(
							'We couldn’t read that file. Try an .xlsx, .csv, .tsv, or text file, or paste the cells above.'
						)
			);
		} finally {
			setReading( false );
		}
	};
	return (
		<div className="agency-site-wizard__intake">
			<div className="agency-site-wizard__intake-entry">
				<div className="agency-site-wizard__url-input">
					<TextareaControl
						ref={ input }
						label={ __( 'Site addresses' ) }
						hideLabelFromVision
						placeholder="your-client.com"
						rows={ 1 }
						value={ value }
						onChange={ onChange }
						help={
							<span id="site-wizard-url-hint">
								{ sprintf(
									/* translators: %s is the keyboard shortcut to insert a new line. */
									__( 'Enter an address or paste a list. Press %s to add another line.' ),
									isAppleOS() ? __( '⌘ Return' ) : __( 'Ctrl+Enter' )
								) }
							</span>
						}
						onKeyDown={ ( event ) => {
							if ( event.key !== 'Enter' || event.nativeEvent.isComposing ) {
								return;
							}
							if ( event.metaKey || event.ctrlKey ) {
								event.preventDefault();
								insertLine();
							} else if ( ! isList && ! event.shiftKey ) {
								event.preventDefault();
								if ( ! reading ) {
									onReview( value );
								}
							}
						} }
						aria-invalid={ !! error }
						aria-describedby={ [
							describedBy,
							'site-wizard-url-hint',
							error ? 'site-wizard-url-error' : undefined,
						]
							.filter( Boolean )
							.join( ' ' ) }
						dir="ltr"
						spellCheck={ false }
						autoCapitalize="none"
						autoComplete="url"
						__nextHasNoMarginBottom
					/>
					<Button
						className="agency-site-wizard__directional-button"
						variant="primary"
						icon={ arrowRight }
						iconSize={ 28 }
						label={ isList ? __( 'Review sites' ) : __( 'Continue' ) }
						onClick={ () => onReview( value ) }
						disabled={ reading }
						__next40pxDefaultSize
					/>
				</div>
				<p id="site-wizard-url-error" className="agency-site-wizard__error" role="alert">
					{ error }
				</p>
			</div>
			{ compact ? (
				<div className="agency-site-wizard__intake-links">
					<Button variant="link" onClick={ () => fileInput.current?.click() } disabled={ reading }>
						{ __( 'Upload a spreadsheet' ) }
					</Button>
					{ footer }
				</div>
			) : (
				<section
					className="agency-site-wizard__intake-alternatives"
					aria-labelledby="site-wizard-intake-alternatives"
				>
					<Heading level={ 3 } id="site-wizard-intake-alternatives">
						{ __( 'Other ways to add sites' ) }
					</Heading>
					<div className="agency-site-wizard__intake-options">
						<Choice
							className="agency-site-wizard__intake-option"
							title={ __( 'Upload a spreadsheet' ) }
							description={ __(
								'Choose a file or drop it here. Excel, CSV, TSV, and text files all work.'
							) }
							illustration={ <IntakeIllustration kind="spreadsheet" /> }
							onClick={ () => fileInput.current?.click() }
							isBusy={ reading }
							disabled={ reading }
							onDragOver={ ( event ) => event.preventDefault() }
							onDrop={ ( event ) => {
								event.preventDefault();
								const file = event.dataTransfer.files[ 0 ];
								if ( file && ! reading ) {
									void read( file );
								}
							} }
						/>
						{ onChooseAccount && (
							<Choice
								className="agency-site-wizard__intake-option"
								title={ __( 'Choose from WordPress.com' ) }
								description={ __(
									'Select sites linked to your account that aren’t in your agency dashboard yet.'
								) }
								illustration={ <IntakeIllustration kind="account" /> }
								onClick={ onChooseAccount }
							/>
						) }
					</div>
				</section>
			) }
			<input
				ref={ fileInput }
				type="file"
				accept=".xlsx,.csv,.tsv,.txt"
				aria-label={ __( 'Upload a site list' ) }
				hidden
				onChange={ ( event ) => {
					const file = event.currentTarget.files?.[ 0 ];
					if ( file ) {
						void read( file );
					}
					event.currentTarget.value = '';
				} }
			/>
			{ fileName && (
				<p className="agency-site-wizard__intake-file-status" role="status">
					{ sprintf(
						/* translators: %s is the uploaded file name. */
						__( 'Added %s. Review or edit the addresses above.' ),
						fileName
					) }
				</p>
			) }
		</div>
	);
}

export function selectedSiteLabel( count: number ) {
	return sprintf(
		/* translators: %d is the number of sites. */
		_n( 'Continue with %d site', 'Continue with %d sites', count ),
		count
	);
}
