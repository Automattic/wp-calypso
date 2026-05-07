import type { Quarter } from './get-most-recent-past-quarter';

// Deadline = last day of the month following the quarter end (Q1→Apr 30, Q2→Jul 31, Q3→Oct 31, Q4→Jan 31 next year).
// Day 0 of the month after the deadline month yields the last day of the deadline month;
// month index 13 wraps via Date.UTC to January of the next year, which is what Q4 needs.
export default function getSubmissionDeadline( { quarter, year }: Quarter ): Date {
	return new Date( Date.UTC( year, quarter * 3 + 1, 0 ) );
}
