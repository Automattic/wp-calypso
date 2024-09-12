import { Icon, post, media, comment, page } from '@wordpress/icons';

type Props = {
	cardData: any;
	status: string;
};

export default function ContentSummary( { status, cardData }: Props ) {
	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> Content importing was <strong>skipped!</strong>
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const progress = cardData.progress;

		return (
			<div className="summary__content">
				<p>We imported:</p>

				{ progress.post.completed !== 0 && (
					<p>
						<Icon icon={ post } />
						<strong>{ progress.post.completed }</strong> posts
					</p>
				) }

				{ progress.page.completed !== 0 && (
					<p>
						<Icon icon={ page } />
						<strong>{ progress.page.completed }</strong> pages
					</p>
				) }

				{ progress.attachment.completed !== 0 && (
					<p>
						<Icon icon={ media } />
						<strong>{ progress.attachment.completed }</strong> media
					</p>
				) }

				{ progress.comment.completed !== 0 && (
					<p>
						<Icon icon={ comment } />
						<strong>{ progress.comment.completed }</strong> comments
					</p>
				) }
			</div>
		);
	}

	if ( status === 'importing' || status === 'processing' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> Content is importing...
				</p>
			</div>
		);
	}

	return;
}
