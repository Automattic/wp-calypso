import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import OnePagerBriefForm from './one-pager-brief-form';
import SocialAssetsBriefForm from './social-assets-brief-form';
import type { AgentStudioAgent } from '../../lib/agents';

import './style.scss';

interface Props {
	agent: AgentStudioAgent;
}

export default function BriefContent( { agent }: Props ) {
	return (
		<VStack spacing={ 6 } className="a4a-agent-studio-brief__content">
			<Card size="small">
				<CardBody>
					<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
						<div className="a4a-agent-studio-brief__agent-icon">
							{ agent.previewImage ? (
								<img src={ agent.previewImage } alt="" />
							) : (
								<Icon icon={ agent.icon } size={ 24 } />
							) }
						</div>
						<VStack spacing={ 1 }>
							<Text weight={ 600 }>{ agent.role }</Text>
							{ agent.greeting.map( ( line ) => (
								<Text key={ line } variant="muted">
									{ line }
								</Text>
							) ) }
						</VStack>
					</HStack>
				</CardBody>
			</Card>

			{ agent.id === 'one-pager' && <OnePagerBriefForm agent={ agent } /> }
			{ agent.id === 'social-assets' && <SocialAssetsBriefForm agent={ agent } /> }
		</VStack>
	);
}
