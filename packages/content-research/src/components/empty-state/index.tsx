import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import './style.scss';

const FEEDBACK_URL =
	'https://radicalupdates.wordpress.com/2026/04/17/last30days-research-your-topical-blog-posts-easily/';

function RobotIllustration() {
	return (
		<div className="content-research-empty__illustration" aria-hidden="true">
			<svg viewBox="0 0 220 140" className="content-research-empty__svg">
				<defs>
					<linearGradient id="cr-empty-bg" x1="0" x2="1" y1="0" y2="1">
						<stop offset="0%" stopColor="#eef2ff" />
						<stop offset="100%" stopColor="#fef2e6" />
					</linearGradient>
					<radialGradient id="cr-lens" cx="0.35" cy="0.35" r="0.7">
						<stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
						<stop offset="60%" stopColor="rgba(216,234,255,0.55)" />
						<stop offset="100%" stopColor="rgba(216,234,255,0.25)" />
					</radialGradient>
				</defs>
				<rect x="0" y="0" width="220" height="140" rx="12" fill="url(#cr-empty-bg)" />

				<g className="cr-blob">
					<circle cx="22" cy="26" r="3" fill="#c7d2fe" />
					<circle cx="198" cy="22" r="2.5" fill="#fed7aa" />
					<circle cx="202" cy="116" r="3" fill="#bfdbfe" />
					<circle cx="20" cy="112" r="2.5" fill="#fde68a" />
					<path
						d="M195 38 L201 38 M198 35 L198 41"
						stroke="#fb923c"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</g>

				<g className="cr-desk">
					<rect x="40" y="118" width="160" height="6" rx="2" fill="#e0e7ff" />
				</g>

				<g className="cr-book">
					<path
						d="M110 96 L110 118 L60 116 Q52 116 52 108 L52 78 Q52 72 60 72 L74 72 Q90 72 110 96 Z"
						fill="#fff"
						stroke="#cbd5f5"
						strokeWidth="1.5"
					/>
					<path
						d="M110 96 L110 118 L160 116 Q168 116 168 108 L168 78 Q168 72 160 72 L146 72 Q130 72 110 96 Z"
						fill="#fff"
						stroke="#cbd5f5"
						strokeWidth="1.5"
					/>
					<line x1="110" y1="96" x2="110" y2="118" stroke="#cbd5f5" strokeWidth="1.5" />
					<line
						x1="62"
						y1="84"
						x2="100"
						y2="92"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="62"
						y1="92"
						x2="100"
						y2="100"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="62"
						y1="100"
						x2="100"
						y2="108"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="62"
						y1="108"
						x2="86"
						y2="112"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="120"
						y1="92"
						x2="158"
						y2="84"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="120"
						y1="100"
						x2="158"
						y2="92"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="120"
						y1="108"
						x2="158"
						y2="100"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<line
						x1="120"
						y1="116"
						x2="146"
						y2="108"
						stroke="#e5e7eb"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</g>

				<g className="cr-robot">
					<line
						x1="92"
						y1="14"
						x2="92"
						y2="8"
						stroke="#1d3aa6"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<circle cx="92" cy="6" r="2.5" fill="#f43f5e" />

					<path
						d="M70 32 Q70 14 92 14 Q114 14 114 32 L114 52 Q114 64 102 64 L82 64 Q70 64 70 52 Z"
						fill="#3858e9"
					/>
					<rect x="74" y="28" width="36" height="22" rx="6" fill="#0c1f5e" />
					<circle cx="84" cy="38" r="3" fill="#7dd3fc" />
					<circle cx="100" cy="38" r="3" fill="#7dd3fc" />
					<circle cx="84" cy="38" r="1" fill="#fff" />
					<circle cx="100" cy="38" r="1" fill="#fff" />
					<path
						d="M86 46 Q92 50 98 46"
						stroke="#bae6fd"
						strokeWidth="2"
						strokeLinecap="round"
						fill="none"
					/>

					<ellipse cx="66" cy="36" rx="6" ry="9" fill="#1d3aa6" />
					<ellipse cx="118" cy="36" rx="6" ry="9" fill="#1d3aa6" />

					<rect x="84" y="60" width="16" height="6" rx="2" fill="#1d3aa6" />
					<path
						d="M58 70 Q56 80 70 88 L100 102 Q120 110 130 96 L126 88 Q120 84 110 86 L90 80 Q78 70 70 68 Q62 66 58 70 Z"
						fill="#3858e9"
					/>

					<g className="cr-arm-right">
						<path
							d="M118 70 Q132 72 142 84 L150 96"
							stroke="#3858e9"
							strokeWidth="9"
							strokeLinecap="round"
							fill="none"
						/>
						<circle cx="152" cy="98" r="5" fill="#e0e7ff" stroke="#1d3aa6" strokeWidth="1.5" />
					</g>

					<g className="cr-arm-left">
						<circle cx="62" cy="98" r="5" fill="#e0e7ff" stroke="#1d3aa6" strokeWidth="1.5" />
					</g>
				</g>

				<g className="cr-magnifier">
					<circle cx="150" cy="98" r="16" fill="url(#cr-lens)" stroke="#1e1e1e" strokeWidth="2.5" />
					<circle cx="150" cy="98" r="16" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
					<line
						x1="162"
						y1="110"
						x2="180"
						y2="128"
						stroke="#1e1e1e"
						strokeWidth="4"
						strokeLinecap="round"
					/>
					<path
						d="M138 90 Q142 86 148 86"
						stroke="#fff"
						strokeWidth="1.8"
						strokeLinecap="round"
						fill="none"
						opacity="0.9"
					/>
				</g>

				<g className="cr-sparkle">
					<path
						d="M186 60 L188 54 L190 60 L196 62 L190 64 L188 70 L186 64 L180 62 Z"
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
