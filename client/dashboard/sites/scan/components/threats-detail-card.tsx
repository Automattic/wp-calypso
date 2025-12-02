import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
	__experimentalText as Text,
} from '@wordpress/components';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { SeverityBadge } from '../severity-badge';
import { getThreatIcon } from '../utils';
import type { Threat } from '@automattic/api-core';

export function ThreatsDetailCard( { threats }: { threats: Threat[] } ) {
	const ThreatDetail = ( { threat }: { threat: Threat } ) => {
		return (
			<HStack justify="space-between">
				<HStack justify="flex-start" alignment="center" spacing={ 4 }>
					<Icon
						className="site-scan-threats__type-icon"
						icon={ getThreatIcon( threat ) }
						size={ 32 }
						style={ { flexShrink: 0 } }
					/>
					<VStack justify="flex-start" spacing={ 1 } wrap>
						<Text weight={ 500 }>{ threat.title }</Text>
						<Text variant="muted">
							{ threats.length > 1 ? threat.fix_description : threat.vulnerability_description }
						</Text>
					</VStack>
				</HStack>
				<SeverityBadge severity={ threat.severity } />
			</HStack>
		);
	};

	return (
		<Card>
			{ threats.map( ( threat, index ) => (
				<div key={ threat.id }>
					<CardBody>
						<ThreatDetail threat={ threat } />
					</CardBody>

					{ index < threats.length - 1 && <CardDivider /> }
				</div>
			) ) }
		</Card>
	);
}
