import { createInterpolateElement } from '@wordpress/element';
import { Icon, verse, page, post, file } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ContentStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface ContentSummaryProps {
	stepContent: ContentStepContent;
	status: string;
	siteName: string;
}

export default function ContentSummary( { status, stepContent }: ContentSummaryProps ) {
	const { __ } = useI18n();
	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } />
					{ createInterpolateElement( __( 'You <strong>skipped</strong> content importing.' ), {
						strong: <strong />,
					} ) }
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const progress = stepContent.progress;
		const posts = progress.post.completed;
		const pages = progress.page.completed;
		const attachments = progress.attachment.completed;

		return (
			<dl className="summary__content-stats">
				{ posts > 0 && (
					<>
						<dt>
							<Icon icon={ verse } /> { __( 'Posts' ) }
						</dt>
						<dd>{ posts }</dd>
					</>
				) }
				{ pages > 0 && (
					<>
						<dt>
							<Icon icon={ page } /> { __( 'Pages' ) }
						</dt>
						<dd>{ pages }</dd>
					</>
				) }
				{ attachments > 0 && (
					<>
						<dt>
							<Icon icon={ file } /> { __( 'Media items' ) }
						</dt>
						<dd>{ attachments }</dd>
					</>
				) }
			</dl>
		);
	}

	return null;
}
