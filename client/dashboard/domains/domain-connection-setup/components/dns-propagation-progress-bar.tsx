import { domainPropagationStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import './dns-propagation-progress-bar-style.scss';
import {
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface Props {
	domainName: string;
}

export default function DnsPropagationProgressBar( { domainName }: Props ) {
	const { data, isLoading, isError } = useQuery( domainPropagationStatusQuery( domainName ) );

	if ( isError || isLoading || ! data ) {
		return null;
	}

	const propagatedCount = data.propagation_status.filter( ( area ) => area.propagated ).length;
	const totalCount = data.propagation_status.length;
	const progressPercentage =
		totalCount > 0 ? Math.round( ( propagatedCount / totalCount ) * 100 ) : 0;

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between">
				<Text weight={ 500 }>{ __( 'Progress' ) }</Text>
				<Text>{ progressPercentage }%</Text>
			</HStack>
			<ProgressBar className="dns-propagation-progress-bar" value={ progressPercentage } />
		</VStack>
	);
}
