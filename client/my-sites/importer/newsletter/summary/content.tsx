import { createInterpolateElement } from '@wordpress/element';
import { verse, page, post, file } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ContentStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import SummaryStat from './SummaryStat';

interface ContentSummaryProps {
	stepContent: ContentStepContent;
	status: string;
}

export default function ContentSummary( { status, stepContent }: ContentSummaryProps ) {
	const { __ } = useI18n();
	if ( status === 'skipped' ) {
		return (
			<p>
				<SummaryStat
					icon={ post }
					label={ createInterpolateElement(
						__( 'You <strong>skipped</strong> content importing.' ),
						{
							strong: <strong />,
						}
					) }
				/>
			</p>
		);
	}

	if ( status === 'done' ) {
		const progress = stepContent.progress;
		const posts = progress.post.completed;
		const pages = progress.page.completed;
		const attachments = progress.attachment.completed;

		return (
			<div className="summary__content-stats">
				{ posts > 0 && <SummaryStat count={ posts } icon={ verse } label={ __( 'Posts' ) } /> }
				{ pages > 0 && <SummaryStat count={ pages } icon={ page } label={ __( 'Pages' ) } /> }
				{ attachments > 0 && (
					<SummaryStat count={ attachments } icon={ file } label={ __( 'Media items' ) } />
				) }
			</div>
		);
	}

	return null;
}
