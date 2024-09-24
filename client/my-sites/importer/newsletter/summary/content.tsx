import { Icon, post } from '@wordpress/icons';
import { ContentStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

function getSummaryCopy( postsNumber: number, pagesNumber: number, attachmentsNumber: number ) {
	if ( postsNumber > 0 && pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } posts</strong>, <strong>{ pagesNumber } pages</strong>{ ' ' }
				and
				<strong>{ attachmentsNumber } media</strong>.
			</>
		);
	}

	if ( postsNumber > 0 && pagesNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ pagesNumber } pages</strong>.
			</>
		);
	}

	if ( postsNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ attachmentsNumber } media</strong>.
			</>
		);
	}

	if ( pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber }</strong> pages and{ ' ' }
				<strong>{ attachmentsNumber } media</strong>.
			</>
		);
	}

	if ( postsNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } posts</strong>.
			</>
		);
	}

	if ( pagesNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } pages</strong>.
			</>
		);
	}

	if ( attachmentsNumber > 0 ) {
		return (
			<>
				We imported <strong>{ postsNumber } media</strong>.
			</>
		);
	}
}

interface ContentSummaryProps {
	stepContent: ContentStepContent;
	status: string;
}

export default function ContentSummary( { status, stepContent }: ContentSummaryProps ) {
	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> You <strong>skipped</strong> content importing.
				</p>
			</div>
		);
	}

	if ( status === 'importing' || status === 'processing' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> <strong>We're importing your content.</strong>
					<br />
					This may take a few minutes. Feel free to leave this window – we'll let you know when it's
					done.
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const progress = stepContent.progress;

		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } />
					{ getSummaryCopy(
						progress.post.completed,
						progress.page.completed,
						progress.attachment.completed
					) }
				</p>
			</div>
		);
	}

	return;
}
