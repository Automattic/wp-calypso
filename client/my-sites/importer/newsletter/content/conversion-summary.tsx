import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { __ } from '@wordpress/i18n';
import { verse, page, file } from '@wordpress/icons';
import InlineSupportLink from 'calypso/components/inline-support-link';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { useDispatch } from 'calypso/state';
import { startMappingAuthors } from 'calypso/state/imports/actions';
import { SummaryStat } from '../components';

import './author-mapping-pane.scss';

interface UnsupportedFilesType {
	[ key: string ]: number;
}

interface PostErrorsType {
	[ errorType: string ]: {
		[ nodeType: string ]: number[];
	};
}

interface ConversionSummaryProps {
	importerStatus: {
		importerId: string;
		customData?: {
			postsNumber?: number;
			pagesNumber?: number;
			attachmentsNumber?: number;
			unsupportedFileTypes?: UnsupportedFilesType;
			postErrors?: PostErrorsType;
		};
	};
}

const UnsupportedFilesMessage = ( {
	unsupportedFileTypes,
}: {
	unsupportedFileTypes: UnsupportedFilesType;
} ) => {
	const fileEntries = Object.entries( unsupportedFileTypes ).filter( ( [ , count ] ) => count > 0 );

	if ( fileEntries.length === 0 ) {
		return null;
	}

	return (
		<div>
			<p>
				{ __( 'We found some image types that we do not support:' ) }
				<InlineSupportLink
					supportContext="accepted-filetypes"
					supportLink={ localizeUrl( 'https://wordpress.com/support/accepted-filetypes/#images' ) }
					showIcon={ false }
				>
					{ __( 'Learn more' ) }
				</InlineSupportLink>
			</p>
			<ul>
				{ fileEntries.map( ( [ ext, count ] ) => (
					<li key={ ext }>
						{ formatNumber( count ) } .{ ext } { count === 1 ? __( 'file' ) : __( 'files' ) }
					</li>
				) ) }
			</ul>
		</div>
	);
};

const getSupportLinkForError = ( errorType: string, nodeType: string ) => {
	const errorMapping: { [ key: string ]: { [ key: string ]: string } } = {
		convert_node_failed: {
			'captioned-button-wrap': localizeUrl(
				'https://wordpress.com/support/importing-content/#unsupported-elements'
			),
			'native-video-embed': localizeUrl( 'https://wordpress.com/support/videos/#embedding-videos' ),
			default: localizeUrl(
				'https://wordpress.com/support/importing-content/#content-conversion-issues'
			),
		},
	};

	return (
		errorMapping[ errorType ]?.[ nodeType ] ||
		errorMapping[ errorType ]?.[ 'default' ] ||
		localizeUrl( 'https://wordpress.com/support/importing-content/' )
	);
};

const getErrorDescription = ( errorType: string, nodeType: string ) => {
	const descriptions: { [ key: string ]: { [ key: string ]: string } } = {
		convert_node_failed: {
			'captioned-button-wrap': __( 'Captioned button elements' ),
			'native-video-embed': __( 'Native video embeds' ),
			default: __( 'Content elements' ),
		},
	};

	return (
		descriptions[ errorType ]?.[ nodeType ] ||
		descriptions[ errorType ]?.[ 'default' ] ||
		__( 'Content items' )
	);
};

const ConversionErrorsMessage = ( { postErrors }: { postErrors: PostErrorsType } ) => {
	const errorEntries = Object.entries( postErrors )
		.flatMap( ( [ errorType, nodeErrors ] ) =>
			Object.entries( nodeErrors ).map( ( [ nodeType, postIds ] ) => ( {
				errorType,
				nodeType,
				count: postIds.length,
				postIds,
			} ) )
		)
		.filter( ( { count } ) => count > 0 );

	if ( errorEntries.length === 0 ) {
		return null;
	}

	return (
		<div>
			<p>
				{ __(
					'Some content elements could not be converted and may not appear correctly in your imported posts:'
				) }
			</p>
			<ul>
				{ errorEntries.map( ( { errorType, nodeType, count } ) => (
					<li key={ `${ errorType }-${ nodeType }` }>
						{ formatNumber( count ) } { getErrorDescription( errorType, nodeType ) }{ ' ' }
						{ count === 1 ? __( 'could not be converted' ) : __( 'could not be converted' ) }.{ ' ' }
						<InlineSupportLink
							supportContext={ `${ errorType }-${ nodeType }` }
							supportLink={ getSupportLinkForError( errorType, nodeType ) }
							showIcon={ false }
						>
							{ __( 'Learn more' ) }
						</InlineSupportLink>
					</li>
				) ) }
			</ul>
		</div>
	);
};

const ConversionSummary = ( { importerStatus }: ConversionSummaryProps ) => {
	const dispatch = useDispatch();

	const handleContinue = () => {
		dispatch( startMappingAuthors( importerStatus.importerId ) );
	};

	const posts = importerStatus?.customData?.postsNumber || 0;
	const pages = importerStatus?.customData?.pagesNumber || 0;
	const attachments = importerStatus?.customData?.attachmentsNumber || 0;
	const unsupportedFiles =
		importerStatus?.customData?.unsupportedFileTypes || ( {} as UnsupportedFilesType );
	const postErrors = importerStatus?.customData?.postErrors || ( {} as PostErrorsType );

	const hasUnsupportedFiles = Object.keys( unsupportedFiles ).length > 0;
	const hasConversionErrors = Object.keys( postErrors ).length > 0;
	const hasIssues = hasUnsupportedFiles || hasConversionErrors;

	return (
		<div className="importer__conversion-summary-pane">
			<div className="importer__notice importer__notice--success">
				<h2>{ __( 'Conversion summary' ) }</h2>
				<p>
					{ hasIssues
						? __(
								'We have converted your content to WordPress. Most of your content was processed successfully, with some items noted below.'
						  )
						: __(
								'We have successfully converted your content to WordPress. Next we will begin uploading it to your site.'
						  ) }
				</p>
				<p>{ __( "Here's what we found:" ) }</p>
				<div className="importer__notice-stats">
					{ posts > 0 && <SummaryStat count={ posts } label={ __( 'Posts' ) } icon={ verse } /> }
					{ pages > 0 && <SummaryStat count={ pages } label={ __( 'Pages' ) } icon={ page } /> }
					{ attachments > 0 && (
						<SummaryStat count={ attachments } label={ __( 'Media items' ) } icon={ file } />
					) }
				</div>
			</div>
			{ hasIssues && (
				<div className="importer__notice importer__notice--warning">
					<h3>{ __( 'Items that need your attention' ) }</h3>
					{ hasUnsupportedFiles && (
						<UnsupportedFilesMessage unsupportedFileTypes={ unsupportedFiles } />
					) }
					{ hasConversionErrors && <ConversionErrorsMessage postErrors={ postErrors } /> }
				</div>
			) }
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton primary onClick={ handleContinue }>
					{ __( 'Continue' ) }
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</div>
	);
};

export default ConversionSummary;
