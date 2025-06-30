import {
	Button,
	ExternalLink,
	Modal,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';

interface SyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	siteSlug: string;
}

const getCopy = ( type: 'pull' | 'push' ) => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
			},
			production: {
				title: __( 'Pull from Staging' ),
				description: __(
					'Pulling will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
			},
			fromLabel: __( 'Pull' ),
			toLabel: __( 'To' ),
			syncSelectionHeading: __( 'What would you like to pull?' ),
			learnMore: __( 'Read more about <a>environment pull</a>.' ),
			submit: __( 'Pull' ),
		};
	}

	return {
		staging: {
			title: __( 'Push to Production' ),
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
		},
		production: {
			title: __( 'Push to Staging' ),
			description: __(
				'Pushing will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
		},
		fromLabel: __( 'Push' ),
		toLabel: __( 'To' ),
		syncSelectionHeading: __( 'What would you like to push?' ),
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

export default function SyncModal( { onClose, syncType, environment, siteSlug }: SyncModalProps ) {
	const copy = getCopy( syncType );
	const modalTitle = copy[ environment ].title;

	// TODO: Once we use the component in the Dashbaord V2, let's get siteSlug from Router instead of the passed prop
	//const { siteSlug } = siteRoute.useParams();

	return (
		<Modal title={ modalTitle } onRequestClose={ onClose } style={ { maxWidth: '668px' } }>
			<VStack spacing={ 6 }>
				<VStack spacing={ 7 }>
					<Text>
						{ createInterpolateElement( copy[ environment ].description, {
							a: <ExternalLink href={ `/backup/${ siteSlug }` } children={ null } />,
						} ) }
					</Text>
					<Text weight={ 500 }>{ copy.syncSelectionHeading }</Text>
					<Text>
						{ createInterpolateElement( copy.learnMore, {
							a: <InlineSupportLink onClick={ onClose } supportContext="hosting-staging-site" />,
						} ) }
					</Text>
				</VStack>
				<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary">{ copy.submit }</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
