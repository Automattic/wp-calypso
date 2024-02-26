import { useMemo, useState } from 'react';
import { LogEntry } from './use-code-deployment-run-log-query';

interface DeploymentRunLogsProps {
	logEntries: LogEntry[];
}

const DeploymentRunLog = ( { entry }: { entry: LogEntry } ) => {
	const [ detailExpanded, setDetailExpanded ] = useState( false );

	const openDetail = () => setDetailExpanded( ( v ) => ! v );

	const detail = useMemo( () => {
		if ( ! entry.context ) {
			return false;
		}

		const { stdout, stderr } = entry.context.command;

		if ( stdout.length === 0 && stdout.length === 0 ) {
			return false;
		}

		return (
			<>
				{ stdout }
				{ stderr }
			</>
		);
	}, [ entry.context ] );

	return (
		<div>
			<button
				css={ {
					cursor: detail ? 'pointer' : undefined,
					margin: 0,
					padding: 0,
					fontFamily: '"Courier 10 Pitch", Courier, monospace',
				} }
				onClick={ detail ? openDetail : undefined }
			>
				{ entry.timestamp } { entry.level.toUpperCase() } { entry.message }
				{ detail && '…' }
			</button>
			{ detailExpanded && detail && (
				<pre
					css={ {
						background: 'white',
						margin: 0,
						paddingBlock: 0,
						fontSize: '14px',
						paddingInline: '16px',
						whiteSpace: 'pre-wrap',
					} }
				>
					{ detail }
				</pre>
			) }
		</div>
	);
};

export const DeploymentRunLogs = ( { logEntries }: DeploymentRunLogsProps ) => {
	return (
		<div css={ { padding: '16px', background: 'var(--color-neutral-0)' } }>
			<div
				css={ {
					maxHeight: '15lh',
					overflowY: 'auto',
				} }
			>
				{ logEntries.map( ( entry ) => (
					<DeploymentRunLog key={ entry.message } entry={ entry } />
				) ) }
			</div>
		</div>
	);
};
