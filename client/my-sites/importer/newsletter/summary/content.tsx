import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, post } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ContentStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface ContentSummaryProps {
	stepContent: ContentStepContent;
	status: string;
}

export default function ContentSummary( { status, stepContent }: ContentSummaryProps ) {
	const { __, _n } = useI18n();
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

	if ( status === 'importing' || status === 'processing' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> <strong>{ __( "We're importing your content." ) }</strong>
					<br />
					{ __(
						"This may take a few minutes. Feel free to leave this window — we'll let you know when it's done."
					) }
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const progress = stepContent.progress;
		const postsNumber = progress.post.completed;
		const pagesNumber = progress.page.completed;
		const attachmentsNumber = progress.attachment.completed;

		return (
			<div className="summary__content">
				<ul>
					{ postsNumber > 0 && (
						<li>
							<Icon icon={ post } />
							{ sprintf(
								// translators: %d is the post count
								_n( '%d post', '%d posts', postsNumber ),
								postsNumber
							) }
						</li>
					) }
					{ pagesNumber > 0 && (
						<li>
							<Icon icon={ post } />
							{ sprintf(
								// translators: %d is the page count
								_n( '%d page', '%d pages', pagesNumber ),
								pagesNumber
							) }
						</li>
					) }
					{ attachmentsNumber > 0 && (
						<li>
							<Icon icon={ post } />
							{ sprintf(
								// translators: %d is the media count
								_n( '%d media', '%d media', attachmentsNumber ),
								attachmentsNumber
							) }
						</li>
					) }
				</ul>
			</div>
		);
	}

	return;
}
