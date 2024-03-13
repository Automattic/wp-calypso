import { translate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { LogEntry, useCodeDeploymentsRunLogDetailQuery } from './use-code-deployment-run-log-query';
import { DeploymentRun } from './use-code-deployment-run-query';

interface DeploymentRunLogsProps {
	logEntries: LogEntry[];
	run: DeploymentRun;
}

const DeploymentRunLog = ( { entry, run }: { entry: LogEntry; run: DeploymentRun } ) => {
	const [ detailExpanded, setDetailExpanded ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );
	const deployment = run.code_deployment!;
	const openDetail = () => setDetailExpanded( ( v ) => ! v );

	const { data: logDetail, isLoading } = useCodeDeploymentsRunLogDetailQuery(
		siteId,
		deployment.id,
		run.id,
		entry.context?.command.command_identifier || null,
		{
			enabled: detailExpanded,
			refetchInterval: 5000,
		}
	);

	const detail = useMemo( () => {
		if ( ! logDetail ) {
			return false;
		}

		const { stdout, stderr } = logDetail;

		if ( stdout?.length === 0 && stderr?.length === 0 ) {
			return false;
		}

		return (
			<>
				{ stdout?.join( '\n' ) }
				{ stderr?.join( '\n' ) }
			</>
		);
	}, [ logDetail ] );

	return (
		<div>
			<button
				css={ {
					cursor: entry.context?.command.command_identifier ? 'pointer' : undefined,
					margin: 0,
					padding: 0,
					fontFamily: '"Courier 10 Pitch", Courier, monospace',
				} }
				onClick={ entry.context?.command.command_identifier ? openDetail : undefined }
			>
				{ entry.timestamp } { entry.level.toUpperCase() } { entry.message }
				{ entry.context?.command.command_identifier && (
					<>
						…{ ' ' }
						<span className="show-more">
							{ detailExpanded ? translate( 'show less' ) : translate( 'show more' ) }
						</span>
					</>
				) }
			</button>
			<div>
				{ detailExpanded && isLoading && (
					<pre>
						<GitHubLoadingPlaceholder />
					</pre>
				) }
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
		</div>
	);
};

export const DeploymentRunLogs = ( { logEntries, run }: DeploymentRunLogsProps ) => {
	return (
		<div css={ { padding: '16px', background: 'var(--color-neutral-0)' } }>
			<div
				css={ {
					maxHeight: '15lh',
					overflowY: 'auto',
				} }
			>
				{ logEntries.map( ( entry ) => (
					<DeploymentRunLog key={ entry.message } entry={ entry } run={ run } />
				) ) }
			</div>
		</div>
	);
};
