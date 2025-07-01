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
import { useDispatch, useSelector } from 'react-redux';
import FileBrowser from '../../../my-sites/backup/backup-contents-page/file-browser';
import { usePullFromStagingMutation } from '../../../sites/staging-site/hooks/use-staging-sync';
import { recordTracksEvent } from '../../../state/analytics/actions';
import getBackupBrowserCheckList from '../../../state/rewind/selectors/get-backup-browser-check-list';
import InlineSupportLink from '../../components/inline-support-link';

// TODO: Temporary style for the PoC
import './style.scss';

interface SyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	siteSlug: string;
	productionSiteId: number;
	stagingSiteId: number;
	querySiteId: number;
	rewindId: number;
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

export default function SyncModal( {
	onClose,
	syncType,
	environment,
	siteSlug,
	productionSiteId,
	stagingSiteId,
	querySiteId,
	rewindId,
}: SyncModalProps ) {
	const copy = getCopy( syncType );
	const modalTitle = copy[ environment ].title;
	const dispatch = useDispatch();
	// const [ syncError, setSyncError ] = useState< string | null >( null );

	// TODO: Once we use the component in the Dashbaord V2, let's get siteSlug from Router instead of the passed prop
	//const { siteSlug } = siteRoute.useParams();
	const browserCheckList = useSelector( ( state ) =>
		getBackupBrowserCheckList( state, querySiteId )
	);

	const { pullFromStaging } = usePullFromStagingMutation( productionSiteId, stagingSiteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success' ) );
			// setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			// setSyncError( error.code );
		},
	} );

	const handleConfirm = () => {
		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			const include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
			pullFromStaging( { types: 'paths', include_paths } );
			onClose();
		}
	};

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
					{ querySiteId === stagingSiteId ? (
						<div className="staging-site-card">
							<FileBrowser rewindId={ rewindId } />
						</div>
					) : (
						'Only implemented for staging sites'
					) }
				</VStack>
				<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" onClick={ handleConfirm }>
						{ copy.submit }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
