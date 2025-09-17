import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { deploymentRunLogDetailQuery, LogEntry } from './deployment-logs-queries';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';
export const DeploymentLogsEntry = ( {
	entry,
	deployment,
	siteId,
}: {
	entry: LogEntry;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
} ) => {
	const [ detailExpanded, setDetailExpanded ] = useState( false );
	const toggleExpandDetail = () => setDetailExpanded( ( v ) => ! v );

	const commandIdentifier = entry.context?.command.command_identifier;
	const hasDetail = !! commandIdentifier;

	const {
		data: logDetail,
		isLoading,
		isError,
	} = useQuery( {
		...deploymentRunLogDetailQuery(
			siteId,
			deployment.code_deployment_id,
			deployment.id,
			commandIdentifier!
		),
		enabled: detailExpanded && hasDetail && !! commandIdentifier,
	} );

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
			return detail;
		}

		if ( isLoading ) {
			return __( 'Fetching log details…' );
		}

		if ( isError ) {
			return __( 'Failed to fetch logs. Please try again.' );
		}

		return null;
	};

	return (
		<HStack spacing={ 3 }>
			<VStack>
				<HStack>
					<Text style={ { color: '#FBFBFB' } }>
						<Text style={ { color: '#B3AFAE' } }> { entry.timestamp } </Text>{ ' ' }
						{ entry.level.toUpperCase() } { entry.message }
					</Text>
					{ hasDetail && (
						<Button
							variant="tertiary"
							style={ {
								cursor: hasDetail ? 'pointer' : 'default',
							} }
							onClick={ toggleExpandDetail }
							disabled={ ! hasDetail }
						>
							<span className="deployment-logs-modal__show-more">
								{ detailExpanded ? __( 'show less' ) : __( 'show more' ) }
							</span>
						</Button>
					) }
				</HStack>
				{ detailExpanded && <Text style={ { color: '#FBFBFB' } }> { getDetail() }</Text> }
			</VStack>
		</HStack>
	);
};
