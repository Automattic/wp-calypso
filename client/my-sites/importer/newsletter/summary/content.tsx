import { Icon, post } from '@wordpress/icons';

type Props = {
	cardData: any;
	status: string;
};

export default function ContentSummary( { status, cardData }: Props ) {
	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> You <strong>skipped</strong> content importing.
				</p>
			</div>
		);
	}

	if ( status === 'importing' || status === 'processing' || status === 'done' ) {
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

	if ( status === 'donee' ) {
		const progress = cardData.progress;

		// TODO Let's fix this copy when applying translations
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ post } /> We imported&nbsp;
					{ progress.post.completed !== 0 && <strong>{ progress.post.completed } posts</strong> }
					{ progress.page.completed !== 0 && <strong>{ progress.page.completed } pages</strong> }
					{ progress.attachment.completed !== 0 && (
						<strong>{ progress.attachment.completed } media</strong>
					) }
					{ progress.comment.completed !== 0 && (
						<strong>{ progress.comment.completed } comments</strong>
					) }
					.
				</p>
			</div>
		);
	}

	return;
}
