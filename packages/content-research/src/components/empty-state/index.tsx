import { Tip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import './style.scss';

const FEEDBACK_URL =
	'https://radicalupdates.wordpress.com/2026/04/17/last30days-research-your-topical-blog-posts-easily/';

export default function EmptyState() {
	return (
		<div className="content-research-empty">
			<div>
				<h3 className="content-research-empty__title">
					{ __( 'Research before you write', 'content-research' ) }
				</h3>
				<p className="content-research-empty__description">
					{ __(
						'Type a topic to pull recent posts and discussions from WordPress.com, Hacker News, Google News, and your own drafts. Pick the sources you care about, then summarize them into an editorial brief in one click.',
						'content-research'
					) }
				</p>
			</div>
			<div className="content-research-empty__footer">
				<Tip>
					{ __(
						'If you highlight text before opening a tool, search will start automatically.',
						'content-research'
					) }
				</Tip>
				<Notice.Root intent="info">
					<Notice.Title>{ __( 'Beta feature', 'content-research' ) }</Notice.Title>
					<Notice.Description>
						{ __( 'Only available for proxied a11ns', 'content-research' ) }
					</Notice.Description>
					<Notice.Actions>
						<Notice.ActionLink href={ FEEDBACK_URL } openInNewTab>
							{ __( 'Share feedback', 'content-research' ) }
						</Notice.ActionLink>
					</Notice.Actions>
				</Notice.Root>
			</div>
		</div>
	);
}
