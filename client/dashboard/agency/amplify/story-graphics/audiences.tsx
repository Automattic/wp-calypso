import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { severityFor } from '../score-severity';

import './audiences.scss';

/** The same report, run on three kinds of homepage. */
export default function AudiencesGraphic() {
	const sites = [
		{ kind: 'prospect', label: __( 'Prospect' ), url: 'oliveandember.example', score: 43 },
		{ kind: 'client', label: __( 'Client' ), url: 'brightsmile.example', score: 71 },
		{ kind: 'agency', label: __( 'Your agency' ), url: 'youragency.example', score: 88 },
	];
	return (
		<div className="dashboard-amplify-story__audiences" aria-hidden="true">
			{ sites.map( ( site ) => (
				<div
					key={ site.kind }
					className="dashboard-amplify-story__audience"
					data-kind={ site.kind }
				>
					<div className="dashboard-amplify-story__audience-bar">
						<i />
						<i />
						<i />
						<span>{ site.url }</span>
					</div>
					<div className="dashboard-amplify-story__audience-body">
						<span className="dashboard-amplify-story__audience-label">{ site.label }</span>
						<Badge intent={ getScoreIntent( site.score ) }>{ `${ site.score }/100` }</Badge>
					</div>
					<div className="dashboard-amplify-story__audience-lines">
						<i />
						<i />
						<i />
					</div>
				</div>
			) ) }
		</div>
	);
}

const SCORE_INTENTS = { good: 'stable', warn: 'medium', danger: 'high' } as const;

function getScoreIntent( score: number ) {
	return SCORE_INTENTS[ severityFor( score, 100 ) ];
}
