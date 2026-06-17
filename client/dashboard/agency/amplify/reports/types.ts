import { __ } from '@wordpress/i18n';
import type { AmplifyMode, AmplifyScore } from '@automattic/api-core';

export type AmplifyRowStatus = 'completed' | 'pending' | 'failed';

/** One table row, normalized from a finished report or an in-flight/failed job. */
export interface AmplifyReportRow {
	id: string;
	url: string;
	agencyName: string | null;
	mode: AmplifyMode;
	timestamp: string;
	status: AmplifyRowStatus;
	score: AmplifyScore | null;
	pdfUrl: string | null;
	failureReason: string | null;
}

export const MODE_LABELS: Record< AmplifyMode, string > = {
	human: __( 'Human' ),
	ai: __( 'AI' ),
	fullanalysis: __( 'Full' ),
};

export const STATUS_LABELS: Record< AmplifyRowStatus, string > = {
	completed: __( 'Completed' ),
	pending: __( 'In progress' ),
	failed: __( 'Failed' ),
};
