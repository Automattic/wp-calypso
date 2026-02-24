import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { extractFilenameFromUrl } from '../../utils/extract-filename';
import './file-details.scss';

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
function formatFileSize( bytes: number ): string {
	if ( ! bytes || bytes === 0 ) {
		return __( 'Unknown', __i18n_text_domain__ );
	}

	const gb = bytes / ( 1024 * 1024 * 1024 );
	if ( gb >= 1 ) {
		// translators: %.1f: File size in gigabytes
		return sprintf( __( '%.1f GB', __i18n_text_domain__ ), gb );
	}

	const mb = bytes / ( 1024 * 1024 );
	if ( mb >= 1 ) {
		// translators: %.1f: File size in megabytes
		return sprintf( __( '%.1f MB', __i18n_text_domain__ ), mb );
	}

	const kb = bytes / 1024;
	// translators: %.1f: File size in kilobytes
	return sprintf( __( '%.1f KB', __i18n_text_domain__ ), kb );
}

interface FileDetailsProps {
	attachmentId: number;
}

export function FileDetails( { attachmentId }: FileDetailsProps ) {
	const attachment = useSelect(
		( select ) => {
			if ( ! attachmentId ) {
				return null;
			}
			return select( coreStore ).getEntityRecord( 'postType', 'attachment', attachmentId ) as any;
		},
		[ attachmentId ]
	);

	const author = useSelect(
		( select ) => {
			if ( ! attachment?.author ) {
				return null;
			}
			return select( coreStore ).getEntityRecord( 'root', 'user', attachment.author ) as any;
		},
		[ attachment?.author ]
	);

	const parentPost = useSelect(
		( select ) => {
			if ( ! attachment?.post ) {
				return null;
			}

			// Try to get parent post as 'post' first (most common)
			const post = select( coreStore ).getEntityRecord(
				'postType',
				'post',
				attachment.post
			) as any;

			if ( post ) {
				return post;
			}

			// If not found, try 'page'
			return select( coreStore ).getEntityRecord( 'postType', 'page', attachment.post ) as any;
		},
		[ attachment?.post ]
	);

	if ( ! attachment ) {
		return null;
	}

	const uploadedDate = attachment.date
		? new Date( attachment.date ).toLocaleDateString( undefined, {
				year: '2-digit',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
		  } )
		: __( 'Unknown', __i18n_text_domain__ );

	const authorName = author?.name || author?.display_name || __( 'Unknown', __i18n_text_domain__ );
	const authorLink = author?.link || null;

	const fileType = attachment.mime_type || __( 'Unknown', __i18n_text_domain__ );

	const fileSize = attachment.media_details?.filesize
		? formatFileSize( attachment.media_details.filesize )
		: __( 'Unknown', __i18n_text_domain__ );

	const width = attachment.media_details?.width || 0;
	const height = attachment.media_details?.height || 0;
	const dimensions =
		width && height
			? sprintf(
					// translators: %1$d: Image width, %2$d: Image height
					__( '%1$d × %2$d', __i18n_text_domain__ ),
					width,
					height
			  )
			: __( 'Unknown', __i18n_text_domain__ );

	// Extract filename from source_url
	const filename = extractFilenameFromUrl(
		attachment.source_url,
		__( 'Untitled', __i18n_text_domain__ )
	);

	return (
		<div className="image-studio-file-details">
			<h3 className="image-studio-file-details__title">
				{ __( 'File Details', __i18n_text_domain__ ) }
			</h3>
			<div className="image-studio-file-details__content">
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'File name:', __i18n_text_domain__ ) }
					</span>
					<span className="image-studio-file-details__value" style={ { wordBreak: 'break-all' } }>
						{ filename }
					</span>
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Uploaded on:', __i18n_text_domain__ ) }
					</span>
					<span className="image-studio-file-details__value">{ uploadedDate }</span>
				</div>
				{ parentPost && (
					<div className="image-studio-file-details__row">
						<span className="image-studio-file-details__label">
							{ __( 'Uploaded to:', __i18n_text_domain__ ) }
						</span>
						<a
							href={ parentPost.link }
							className="image-studio-file-details__value image-studio-file-details__link"
							target="_blank"
							rel="noreferrer noopener"
						>
							{ parentPost.title.raw }
						</a>
					</div>
				) }
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Uploaded by:', __i18n_text_domain__ ) }
					</span>
					{ authorLink ? (
						<a
							href={ authorLink }
							className="image-studio-file-details__value image-studio-file-details__link"
							target="_blank"
							rel="noreferrer noopener"
						>
							{ authorName }
						</a>
					) : (
						<span className="image-studio-file-details__value">{ authorName }</span>
					) }
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'File type:', __i18n_text_domain__ ) }
					</span>
					<span className="image-studio-file-details__value">{ fileType }</span>
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Size:', __i18n_text_domain__ ) }
					</span>
					<span className="image-studio-file-details__value">{ fileSize }</span>
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Dimensions:', __i18n_text_domain__ ) }
					</span>
					<span className="image-studio-file-details__value">{ dimensions }</span>
				</div>
			</div>
		</div>
	);
}
