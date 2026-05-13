import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import './style.scss';

const FEEDBACK_URL =
	'https://radicalupdates.wordpress.com/2026/04/17/last30days-research-your-topical-blog-posts-easily/';

function RobotIllustration() {
	return (
		<div className="content-research-empty__illustration" aria-hidden="true">
			<svg viewBox="0 0 140 110" className="content-research-empty__svg">
				<defs>
					<linearGradient id="cr-empty-bg" x1="0" x2="1" y1="0" y2="1">
						<stop offset="0%" stopColor="#eef2ff" />
						<stop offset="100%" stopColor="#fef2e6" />
					</linearGradient>
				</defs>
				<rect x="0" y="0" width="140" height="110" rx="10" fill="url(#cr-empty-bg)" />

				<g className="cr-blob">
					<circle cx="22" cy="26" r="3" fill="#c7d2fe" />
					<circle cx="118" cy="20" r="2.5" fill="#fed7aa" />
					<circle cx="120" cy="86" r="3" fill="#bfdbfe" />
					<circle cx="20" cy="84" r="2.5" fill="#fde68a" />
				</g>

				<g className="cr-robot">
					<rect x="48" y="18" width="44" height="38" rx="10" fill="#3858e9" />
					<rect x="54" y="26" width="32" height="20" rx="6" fill="#0c1f5e" />
					<circle cx="62" cy="36" r="3" fill="#7dd3fc" />
					<circle cx="78" cy="36" r="3" fill="#7dd3fc" />
					<rect x="66" y="44" width="8" height="2" rx="1" fill="#bae6fd" />
					<line x1="70" y1="18" x2="70" y2="10" stroke="#3858e9" strokeWidth="2" />
					<circle cx="70" cy="9" r="3" fill="#f43f5e" />
					<rect x="40" y="34" width="8" height="14" rx="3" fill="#3858e9" />
					<rect x="92" y="34" width="8" height="14" rx="3" fill="#3858e9" />
				</g>

				<g className="cr-card">
					<rect x="30" y="62" width="80" height="38" rx="6" fill="#fff" stroke="#dbdbdb" />
					<rect x="36" y="68" width="6" height="6" rx="1" fill="#3858e9" />
					<line
						x1="46"
						y1="71"
						x2="92"
						y2="71"
						stroke="#cbd5f5"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<line
						x1="36"
						y1="80"
						x2="100"
						y2="80"
						stroke="#e5e7eb"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<line
						x1="36"
						y1="86"
						x2="92"
						y2="86"
						stroke="#e5e7eb"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<line
						x1="36"
						y1="92"
						x2="80"
						y2="92"
						stroke="#e5e7eb"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</g>

				<g className="cr-sparkle">
					<path
						d="M114 56 L116 50 L118 56 L124 58 L118 60 L116 66 L114 60 L108 58 Z"
						fill="#f59e0b"
					/>
				</g>
			</svg>
		</div>
	);
}

export default function EmptyState() {
	return (
		<div className="content-research-empty">
			<RobotIllustration />
			<h3 className="content-research-empty__title">
				{ __( 'Research before you write', 'content-research' ) }
			</h3>
			<p className="content-research-empty__description">
				{ __(
					'Type a topic to pull recent posts and discussions from WordPress.com, Hacker News, Google News, and your own drafts. Pick the sources you care about, then summarize them into an editorial brief in one click.',
					'content-research'
				) }
			</p>
			<Notice.Root intent="info" className="content-research-empty__notice">
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
	);
}
