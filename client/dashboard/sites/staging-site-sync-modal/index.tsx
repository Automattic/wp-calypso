import { Button, ExternalLink, Modal, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';

import './style.scss';

interface SyncModalProps {
	isOpen: boolean;
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	siteSlug: string;
}

const useCopy = ( type: 'pull' | 'push' ) => {
	return useMemo( () => {
		if ( type === 'pull' ) {
			return {
				staging: {
					title: __( 'Pull from Production' ),
					description: __(
						'Pulling will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
					),
				},
				production: {
					title: __( 'Pull from Staging' ),
					description: __(
						'Pulling will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
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
					'Pushing will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
			},
			production: {
				title: __( 'Push to Staging' ),
				description: __(
					'Pushing will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
			},
			fromLabel: __( 'Push' ),
			toLabel: __( 'To' ),
			syncSelectionHeading: __( 'What would you like to push?' ),
			learnMore: __( 'Read more about <a>environment push</a>.' ),
			submit: __( 'Push' ),
		};
	}, [ type ] );
};

export default function SyncModal( {
	isOpen,
	onClose,
	syncType,
	environment,
	siteSlug,
}: SyncModalProps ) {
	const copy = useCopy( syncType );
	const modalTitle = copy[ environment ].title;

	// TODO: Once we use the component in the Dashbaord V2, let's get siteSlug from Router instead of the passed prop
	//const { siteSlug } = siteRoute.useParams();

	if ( ! isOpen ) {
		return null;
	}

	return (
		<>
			<Modal title={ modalTitle } onRequestClose={ onClose } className="staging-site-sync-modal">
				<div className="staging-site-sync-modal__content">
					<div className="staging-site-sync-modal__description">
						<Text>
							{ createInterpolateElement( copy[ environment ].description, {
								a: <ExternalLink href={ `/backup/${ siteSlug }` } children={ null } />,
							} ) }
						</Text>
					</div>
					<div className="staging-site-sync-modal__sync-selection">
						<Text>{ copy.syncSelectionHeading }</Text>
					</div>
					<div className="staging-site-sync-modal__read-more">
						<Text>
							{ createInterpolateElement( copy.learnMore, {
								a: (
									<InlineSupportLink
										onClick={ onClose }
										supportContext="hosting-staging-site-sync"
									/>
								),
							} ) }
						</Text>
					</div>
				</div>
				<div className="staging-site-sync-modal__footer">
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary">{ copy.submit }</Button>
				</div>
			</Modal>
		</>
	);
}
