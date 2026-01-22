import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import './file-details.scss';

/**
 * Format file size in bytes to human-readable format
 *
 * @param {number} bytes - File size in bytes
 * @return {string} Formatted file size string
 */
function formatFileSize( bytes: number ): string {
	if ( ! bytes || bytes === 0 ) {
		return __( 'Unknown', 'default' );
	}

	const gb = bytes / ( 1024 * 1024 * 1024 );
	if ( gb >= 1 ) {
		// translators: %.1f: File size in gigabytes
		return sprintf( __( '%.1f GB', 'default' ), gb );
	}

	const mb = bytes / ( 1024 * 1024 );
	if ( mb >= 1 ) {
		// translators: %.1f: File size in megabytes
		return sprintf( __( '%.1f MB', 'default' ), mb );
	}

	const kb = bytes / 1024;
	// translators: %.1f: File size in kilobytes
	return sprintf( __( '%.1f KB', 'default' ), kb );
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

			if ( post ) return post;

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
		: __( 'Unknown', 'default' );

	const authorName = author?.name || author?.display_name || __( 'Unknown', 'default' );
	const authorLink = author?.link || null;

	const fileType = attachment.mime_type || __( 'Unknown', 'default' );

	const fileSize = attachment.media_details?.filesize
		? formatFileSize( attachment.media_details.filesize )
		: __( 'Unknown', 'default' );

	const width = attachment.media_details?.width || 0;
	const height = attachment.media_details?.height || 0;
	const dimensions =
		width && height
			? sprintf(
					// translators: %1$d: Image width, %2$d: Image height
					__( '%1$d × %2$d', 'default' ),
					width,
					height
			  )
			: __( 'Unknown', 'default' );

	return (
		<div className="image-studio-file-details">
			<h3 className="image-studio-file-details__title">{ __( 'File details', 'default' ) }</h3>
			<div className="image-studio-file-details__content">
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Uploaded on:', 'default' ) }
					</span>
					<span className="image-studio-file-details__value">{ uploadedDate }</span>
				</div>
				{ parentPost && (
					<div className="image-studio-file-details__row">
						<span className="image-studio-file-details__label">
							{ __( 'Uploaded to:', 'default' ) }
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
						{ __( 'Uploaded by:', 'default' ) }
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
						{ __( 'File type:', 'default' ) }
					</span>
					<span className="image-studio-file-details__value">{ fileType }</span>
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">{ __( 'Size:', 'default' ) }</span>
					<span className="image-studio-file-details__value">{ fileSize }</span>
				</div>
				<div className="image-studio-file-details__row">
					<span className="image-studio-file-details__label">
						{ __( 'Dimensions:', 'default' ) }
					</span>
					<span className="image-studio-file-details__value">{ dimensions }</span>
				</div>
			</div>
		</div>
	);
}
