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
			<p>
				<Icon icon={ post } />
				{ createInterpolateElement( __( 'You <strong>skipped</strong> content importing.' ), {
					strong: <strong />,
				} ) }
			</p>
		);
	}

	if ( status === 'done' ) {
		const progress = stepContent.progress;
		const posts = progress.post.completed;
		const pages = progress.page.completed;
		const attachments = progress.attachment.completed;

		return (
			<table className="summary__content-stats">
				{ posts > 0 && (
					<tr>
						<td>
							<Icon icon={ verse } />
						</td>
						<td className="summary__content-stats-label">{ __( 'Posts' ) }</td>
						<td>
							<strong>{ posts }</strong>
						</td>
					</tr>
				) }
				{ pages > 0 && (
					<tr>
						<td>
							<Icon icon={ page } />
						</td>
						<td className="summary__content-stats-label">{ __( 'Pages' ) }</td>
						<td>
							<strong>{ pages }</strong>
						</td>
					</tr>
				) }
				{ attachments > 0 && (
					<tr>
						<td>
							<Icon icon={ file } />
						</td>
						<td className="summary__content-stats-label">{ __( 'Media items' ) }</td>
						<td>
							<strong>{ attachments }</strong>
						</td>
					</tr>
				) }
			</table>
		);
	}

	return null;
}
