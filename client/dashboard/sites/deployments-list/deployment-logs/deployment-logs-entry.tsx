import { deploymentRunLogDetailQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Spinner,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { useLocale } from '../../../app/locale';
import { formatDate } from '../../../utils/datetime';
import type { DeploymentRunWithDeploymentInfo, LogEntry } from '@automattic/api-core';

export const DeploymentLogsEntry = ( {
	entry,
	deployment,
	siteId,
}: {
	entry: LogEntry;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
} ) => {
	const locale = useLocale();

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
			return (
				<HStack alignment="center">
					<Spinner />
				</HStack>
			);
		}

		if ( isError ) {
			return __( 'Failed to fetch logs. Please try again.' );
		}

		return null;
	};

	return (
		<HStack spacing={ 3 }>
			<VStack spacing={ 2 }>
				<Text style={ { color: '#FBFBFB', whiteSpace: 'pre-wrap' } } as="code">
					<Text style={ { color: '#B3AFAE' } }>
						{ formatDate( new Date( entry.timestamp ), locale, { timeStyle: 'medium' } ) }
					</Text>{ ' ' }
					{ entry.level.toUpperCase() } { entry.message }
					{ hasDetail && (
						<Button
							variant="link"
							style={ {
								color: '#FBFBFB',
								marginInlineStart: '4px',
							} }
							onClick={ toggleExpandDetail }
							disabled={ ! hasDetail }
						>
							{ detailExpanded ? __( 'show less' ) : __( 'show more' ) }
						</Button>
					) }
				</Text>
				{ detailExpanded && (
					<Text style={ { color: '#FBFBFB', whiteSpace: 'pre-wrap' } } as="code">
						{ getDetail() }
					</Text>
				) }
			</VStack>
		</HStack>
	);
};
