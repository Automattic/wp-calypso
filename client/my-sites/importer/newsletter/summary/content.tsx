import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, verse, page, file } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ContentStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

function getSummaryCopy( postsNumber: number, pagesNumber: number, attachmentsNumber: number ) {
	return (
		<div className="summary__content-stats">
			{ postsNumber > 0 && (
				<div className="summary__content-stat-item">
					<Icon icon={ verse } /> <span>{ __( 'Posts' ) }</span> <strong>{ postsNumber }</strong>
				</div>
			) }
			{ pagesNumber > 0 && (
				<div className="summary__content-stat-item">
					<Icon icon={ page } /> <span>{ __( 'Pages' ) }</span> <strong>{ pagesNumber }</strong>
				</div>
			) }
			{ attachmentsNumber > 0 && (
				<div className="summary__content-stat-item">
					<Icon icon={ file } /> <span>{ __( 'Media' ) }</span>{ ' ' }
					<strong>{ attachmentsNumber }</strong>
				</div>
			) }
		</div>
	);
}

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

		return (
			<div className="summary__content">
				<p>{ __( "Here's a summary of the imported data:" ) }</p>
				<p>
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
