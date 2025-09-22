import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { video, verse, page, file, Icon, audio, gallery, post, code, help } from '@wordpress/icons';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { useDispatch } from 'calypso/state';
import { startMappingAuthors, cancelImport } from 'calypso/state/imports/actions';
import { SummaryStat } from '../components';

interface UnsupportedFilesType {
	[ key: string ]: number;
}

interface PostErrorsType {
	[ errorType: string ]: { [ nodeType: string ]: number[] } | number[];
}

interface ConversionSummaryProps {
	siteId: number;
	importerEngine: string;
	fromSite: string;
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

	const message =
		( fileEntries.length === 1
			? sprintf(
					/* translators: %s is the file type */
					__(
						'You had an image file type that we do not support. You will need to convert any <strong>%s</strong> files to a different format and upload them.'
					),
					fileEntries[ 0 ][ 0 ]
			  )
			: sprintf(
					/* translators: %s is a comma separated list of file types */
					__(
						'You had some image file types that we do not support. You will need to convert any %s files to a different format and upload them.'
					),
					fileEntries.map( ( [ ext ] ) => '<strong>' + ext + '</strong>' ).join( ', ' )
			  ) ) + ' ';

	return (
		<div className="conversion-summary__unsupported-files">
			<p>
				{ createInterpolateElement(
					message + __( '<supportLink>Learn more about the supported file types.</supportLink>' ),
					{
						supportLink: (
							<InlineSupportLink
								supportLink={ localizeUrl(
									'https://wordpress.com/support/accepted-filetypes/#images'
								) }
								showIcon={ false }
								supportPostId={ 2037 }
							/>
						),
						strong: <strong />,
					}
				) }
			</p>
		</div>
	);
};

const weHaveBlocksForTheseMap: {
	[ key: string ]: {
		nodeName: string;
		blockName: string;
		icon: JSX.Element;
		supportLink: string;
		supportPostId: number;
	};
} = {
	'native-video-embed': {
		nodeName: 'Native video embed',
		blockName: 'Video block',
		icon: video,
		supportLink: localizeUrl(
			'https://wordpress.com/support/wordpress-editor/blocks/video-block/'
		),
		supportPostId: 149045,
	},
	'native-audio-embed': {
		nodeName: 'Native audio embed',
		blockName: 'Audio block',
		icon: audio,
		supportLink: localizeUrl(
			'https://wordpress.com/support/wordpress-editor/blocks/audio-block/'
		),
		supportPostId: 148670,
	},
	'digest-post-embed': {
		nodeName: 'Embedded post',
		blockName: 'Embed block',
		icon: post,
		supportLink: localizeUrl(
			'https://wordpress.com/support/wordpress-editor/blocks/embed-block/'
		),
		supportPostId: 150644,
	},
	'poll-embed': {
		nodeName: 'Poll embed',
		blockName: 'Poll block',
		icon: help,
		supportLink: localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/poll-block/' ),
		supportPostId: 170183,
	},
	'latex-rendered': {
		nodeName: 'LaTeX content',
		blockName: 'LaTeX block',
		icon: code,
		supportLink: localizeUrl( 'https://wordpress.com/support/latex/' ),
		supportPostId: 97,
	},
	'image-gallery-embed': {
		nodeName: 'Image gallery',
		blockName: 'Image Gallery block',
		icon: gallery,
		supportLink: localizeUrl(
			'https://wordpress.com/support/wordpress-editor/blocks/gallery-block/'
		),
		supportPostId: 148667,
	},
};

const PostErrorsMessage = ( { postErrors }: { postErrors: PostErrorsType } ) => {
	const nodeFailedErrors = postErrors.convert_node_failed || {};
	const hasNodeFailedErrors = Object.keys( nodeFailedErrors ).length > 0;

	const gutenbergFailedErrors = postErrors.convert_html_to_gutenberg_failed;

	if ( ! hasNodeFailedErrors && ! gutenbergFailedErrors ) {
		return null;
	}

	return (
		<div className="conversion-summary__post-errors">
			{ gutenbergFailedErrors && (
				<p>{ __( 'We found some posts that had no content in them so they were skipped.' ) }</p>
			) }
			{ hasNodeFailedErrors && (
				<>
					<p>
						{ __(
							'Some of the content could not not be converted properly. You can manually add them to your site using the blocks below.'
						) }
					</p>
					{ Object.entries( nodeFailedErrors ).map(
						( [ nodeType ] ) =>
							weHaveBlocksForTheseMap[ nodeType ] && (
								<div key={ nodeType } className="post-errors__item">
									<Icon
										icon={ weHaveBlocksForTheseMap[ nodeType ].icon }
										size={ 20 }
										className="post-errors__item-icon"
									/>
									<p>
										{ createInterpolateElement(
											sprintf(
												/* translators: %s is the node name, %s is the block name */
												__(
													'%(nodeName)s can be added using the <supportLink>%(blockName)s</supportLink>.'
												),
												{
													nodeName: weHaveBlocksForTheseMap[ nodeType ].nodeName,
													blockName: weHaveBlocksForTheseMap[ nodeType ].blockName,
												}
											),
											{
												supportLink: (
													<InlineSupportLink
														showIcon={ false }
														supportPostId={ weHaveBlocksForTheseMap[ nodeType ].supportPostId }
														supportLink={ weHaveBlocksForTheseMap[ nodeType ].supportLink }
													/>
												),
											}
										) }
									</p>
								</div>
							)
					) }
				</>
			) }
		</div>
	);
};

const ConversionSummary = ( {
	siteId,
	importerStatus,
	importerEngine,
	fromSite,
}: ConversionSummaryProps ) => {
	const dispatch = useDispatch();
	const { resetPaidNewsletter } = useResetMutation();

	const handleContinue = () => {
		dispatch( startMappingAuthors( importerStatus.importerId ) );
	};

	const handleBack = () => {
		resetPaidNewsletter( siteId, importerEngine, 'content', fromSite );
		dispatch( cancelImport( siteId, importerStatus.importerId ) );
	};

	const posts = importerStatus?.customData?.postsNumber || 0;
	const pages = importerStatus?.customData?.pagesNumber || 0;
	const attachments = importerStatus?.customData?.attachmentsNumber || 0;
	const unsupportedFiles = importerStatus?.customData?.unsupportedFileTypes || {};
	const postErrors = importerStatus?.customData?.postErrors || {};

	const hasUnsupportedFiles = Object.keys( unsupportedFiles ).length > 0;
	const hasPostErrors = Object.keys( postErrors ).length > 0;

	const hasIssues = hasUnsupportedFiles || hasPostErrors;

	return (
		<div className="importer__conversion-summary-pane">
			<div className="conversion-summary__success">
				<h2>{ __( 'Conversion summary' ) }</h2>
				<p>
					{ ( hasIssues
						? __(
								'We have converted your content to WordPress. Most of your content was processed successfully, with some items noted below.'
						  )
						: __(
								'We have successfully converted your content to WordPress. Next we will begin uploading it to your site.'
						  ) ) + ' ' }
					{ __( "Here's an overview of what will be added to your site." ) }
				</p>
				<div className="success-stats summary__content-stats">
					{ posts > 0 && <SummaryStat count={ posts } label={ __( 'Posts' ) } icon={ verse } /> }
					{ pages > 0 && <SummaryStat count={ pages } label={ __( 'Pages' ) } icon={ page } /> }
					{ attachments > 0 && (
						<SummaryStat count={ attachments } label={ __( 'Media items' ) } icon={ file } />
					) }
				</div>
			</div>
			{ hasIssues && (
				<>
					<hr />
					<div className="conversion-summary__issues">
						<h2>{ __( 'Items that need your attention' ) }</h2>
						{ hasUnsupportedFiles && (
							<UnsupportedFilesMessage unsupportedFileTypes={ unsupportedFiles } />
						) }
						{ hasPostErrors && <PostErrorsMessage postErrors={ postErrors } /> }
					</div>
				</>
			) }

			<ImporterActionButtonContainer>
				<ImporterActionButton primary onClick={ handleContinue }>
					{ __( 'Continue' ) }
				</ImporterActionButton>
				<ImporterActionButton onClick={ handleBack }>{ __( 'Go back' ) }</ImporterActionButton>
			</ImporterActionButtonContainer>
		</div>
	);
};

export default ConversionSummary;
