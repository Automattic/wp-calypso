import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LogEntry, useCodeDeploymentsRunLogDetailQuery } from './use-code-deployment-run-log-query';
import { DeploymentRun } from './use-code-deployment-run-query';

interface DeploymentRunLogsProps {
	logEntries: LogEntry[];
	run: DeploymentRun;
}

const LogDetail = ( { children }: { children?: ReactNode } ) => (
	<pre
		css={ {
			margin: 0,
			paddingBlock: 0,
			fontSize: '14px',
			paddingInline: '16px',
			whiteSpace: 'pre-wrap',
		} }
	>
		{ children }
	</pre>
);

const DeploymentRunLog = ( { entry, run }: { entry: LogEntry; run: DeploymentRun } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ detailExpanded, setDetailExpanded ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );
	const openDetail = () => setDetailExpanded( ( v ) => ! v );

	const commandIdentifier = entry.context?.command.command_identifier;
	const hasDetail = !! commandIdentifier;

	const {
		data: logDetail,
		isLoading,
		isError,
	} = useCodeDeploymentsRunLogDetailQuery(
		siteId,
		run.code_deployment_id,
		run.id,
		commandIdentifier ?? null,
		{
			enabled: detailExpanded && hasDetail,
			refetchOnWindowFocus: false,
			retry: false,
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

	const getDetail = () => {
		if ( detail ) {
			return <LogDetail>{ detail }</LogDetail>;
		}

		if ( isLoading ) {
			return <LogDetail>{ __( 'Fetching log details…' ) }</LogDetail>;
		}

		if ( isError ) {
			return <LogDetail>{ __( 'Failed to fetch logs. Please try again.' ) }</LogDetail>;
		}

		return null;
	};

	const handleToggleExpand = () => {
		if ( hasDetail ) {
			openDetail();
		}
	};
	return (
		<div>
			<button
				css={ {
					cursor: hasDetail ? 'pointer' : undefined,
					margin: 0,
					padding: 0,
					fontFamily: '"Courier 10 Pitch", Courier, monospace',
				} }
				onClick={ () => {
					if ( ! detailExpanded ) {
						dispatch( recordTracksEvent( 'calypso_hosting_github_log_entry_expanded' ) );
					}
					handleToggleExpand();
				} }
			>
				{ entry.timestamp } { entry.level.toUpperCase() } { entry.message }
				{ hasDetail && (
					<>
						…{ ' ' }
						<span className="show-more">
							{ detailExpanded ? __( 'show less' ) : __( 'show more' ) }
						</span>
					</>
				) }
			</button>
			{ detailExpanded && getDetail() }
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
