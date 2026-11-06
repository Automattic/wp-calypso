import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe, Icon, people, shield } from '@wordpress/icons';
import RouterLinkButton from '../../../components/router-link-button';
import { MARKETPLACE_HOSTING_ROUTE, MARKETPLACE_PRODUCTS_ROUTE } from '../../marketplace/paths';
import { TEAM_ROUTE } from '../../team/paths';

export interface SiteWelcome {
	kind: 'connect' | 'development' | 'hosted' | 'migrate';
	title: string;
	description: string;
}

interface NextStep {
	icon: JSX.Element;
	title: string;
	description: string;
	action: string;
	to: string;
}

/** Shown over the Sites list once a new, moved, or connected site lands in it. */
export default function WelcomeModal( {
	welcome,
	onClose,
}: {
	welcome: SiteWelcome;
	onClose: () => void;
} ) {
	const invite: NextStep = {
		icon: people,
		title: __( 'Invite your team' ),
		description: __( 'Give teammates access to your sites.' ),
		action: __( 'Invite' ),
		to: TEAM_ROUTE,
	};
	const protect: NextStep = {
		icon: shield,
		title: __( 'Add security and backups' ),
		description: __( 'Jetpack products from the Marketplace.' ),
		action: __( 'Browse' ),
		to: MARKETPLACE_PRODUCTS_ROUTE,
	};
	const launch: NextStep = {
		icon: globe,
		title: __( 'Launch when it’s ready' ),
		description: __( 'Add hosting and connect a domain.' ),
		action: __( 'See hosting' ),
		to: MARKETPLACE_HOSTING_ROUTE,
	};
	const steps = welcome.kind === 'development' ? [ invite, launch ] : [ invite, protect ];
	return (
		<Modal title={ welcome.title } onRequestClose={ onClose } size="medium">
			<VStack spacing={ 6 }>
				<Text variant="muted">{ welcome.description }</Text>
				<ul className="agency-site-wizard__next-steps" aria-label={ __( 'Next steps' ) }>
					{ steps.map( ( step ) => (
						<li key={ step.title }>
							<Icon icon={ step.icon } />
							<VStack spacing={ 0 } className="agency-site-wizard__plugin-text">
								<Text weight={ 500 }>{ step.title }</Text>
								<Text variant="muted">{ step.description }</Text>
							</VStack>
							<RouterLinkButton to={ step.to } variant="tertiary" __next40pxDefaultSize>
								{ step.action }
							</RouterLinkButton>
						</li>
					) ) }
				</ul>
				<HStack justify="flex-end">
					<Button variant="primary" onClick={ onClose } __next40pxDefaultSize>
						{ __( 'Done' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
