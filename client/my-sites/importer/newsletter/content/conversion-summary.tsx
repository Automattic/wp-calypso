import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { verse, page, file } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import InlineSupportLink from 'calypso/components/inline-support-link';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { useDispatch } from 'calypso/state';
import { startMappingAuthors } from 'calypso/state/imports/actions';
import { SummaryStat } from '../components';

import './author-mapping-pane.scss';

interface ConversionSummaryProps {
	importerStatus: {
		importerId: string;
		customData?: {
			postsNumber?: number;
			pagesNumber?: number;
			attachmentsNumber?: number;
			unsupportedFileTypes?: Record< string, number > | Array< null >;
		};
	};
}

export default function ConversionSummary( { importerStatus }: ConversionSummaryProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const handleContinue = () => {
		dispatch( startMappingAuthors( importerStatus.importerId ) );
	};

	const posts = importerStatus?.customData?.postsNumber || 0;
	const pages = importerStatus?.customData?.pagesNumber || 0;
	const attachments = importerStatus?.customData?.attachmentsNumber || 0;
	const unsupportedFiles = importerStatus?.customData?.unsupportedFileTypes;

	const getUnsupportedFilesMessage = () => {
		if ( ! unsupportedFiles || Array.isArray( unsupportedFiles ) ) {
			return null;
		}

		const fileTypes = Object.entries( unsupportedFiles ).filter( function ( entry ) {
			return entry[ 1 ] > 0;
		} );
		if ( fileTypes.length === 0 ) {
			return null;
		}

		const formattedTypes = fileTypes.map( ( [ type, count ] ) => {
			/* translators: %(count)s is the number of files, %(type)s is the file extension (e.g. "avif", "svg") */
			return formatNumber( count ) + ' .' + type + ( count === 1 ? ' image' : ' images' );
		} );

		const learnMoreLink = (
			<InlineSupportLink
				showIcon={ false }
				supportLink={ localizeUrl( 'https://wordpress.com/support/accepted-filetypes/#images' ) }
				supportPostId={ 2037 }
			/>
		);

		if ( formattedTypes.length === 1 ) {
			return (
				<>
					{ __( 'We were unable to import' ) }
					{ formattedTypes[ 0 ] }. { learnMoreLink }
					{ __( 'Learn more' ) }
				</>
			);
		}

		const lastType = formattedTypes.pop();
		return (
			<>
				{ __( 'We were unable to import' ) }
				{ formattedTypes.join( ', ' ) }
				{ __( 'and' ) }
				{ lastType }. { learnMoreLink }
				{ __( 'Learn more' ) }
			</>
		);
	};

	const unsupportedFilesMessage = getUnsupportedFilesMessage();

	return (
		<div className="importer__mapping-pane">
			{ unsupportedFilesMessage && (
				<div className="importer__notice importer__notice--warning">
					{ unsupportedFilesMessage }
				</div>
			) }
			<div className="importer__notice importer__notice--success">
				<p>{ __( "All set! We've found:" ) }</p>
				<div className="importer__notice-stats">
					{ posts > 0 && <SummaryStat count={ posts } label={ __( 'Posts' ) } icon={ verse } /> }
					{ pages > 0 && <SummaryStat count={ pages } label={ __( 'Pages' ) } icon={ page } /> }
					{ attachments > 0 && (
						<SummaryStat count={ attachments } label={ __( 'Media items' ) } icon={ file } />
					) }
				</div>
			</div>
			<h2>{ __( 'Conversion summary' ) }</h2>
			<p>
				{ __( 'Your content has been successfully processed and is ready for author mapping.' ) }
			</p>
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton primary onClick={ handleContinue }>
					{ __( 'Continue' ) }
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</div>
	);
}
