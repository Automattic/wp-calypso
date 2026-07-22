import { __experimentalVStack as VStack } from '@wordpress/components';
import { TextSkeleton } from '../../../components/text-skeleton';
import MigrationsCommissionsList from './commissions-list';
import MigrationsConsolidatedCommissions from './consolidated-commissions';
import MigrationsCommissionsEmptyState from './empty-state';
import MigrationsTagSitesModal from './tag-sites-modal';
import type { RecordTracksEvent, ShowSuccessNotice, TaggedSite } from './types';
import type { ComponentType, ReactNode } from 'react';

interface MigrationsCommissionsContentProps {
	taggedSites: TaggedSite[];
	isLoading: boolean;
	recordTracksEvent: RecordTracksEvent;
	onSuccess: ShowSuccessNotice;
	onError: ( message: string ) => void;
	getSiteCreatedAt: ( blogId: number ) => string | undefined;
	locale: string;
	canTagSitesForCommission: boolean;
	migrationTags: string[];
	isAddSitesModalOpen: boolean;
	onCloseAddSitesModal: () => void;
	onOpenAddSitesModal: () => void;
	TableWrapper?: ComponentType< { children: ReactNode } >;
}

export default function MigrationsCommissionsContent( {
	taggedSites,
	isLoading,
	recordTracksEvent,
	onSuccess,
	onError,
	getSiteCreatedAt,
	locale,
	canTagSitesForCommission,
	migrationTags,
	isAddSitesModalOpen,
	onCloseAddSitesModal,
	onOpenAddSitesModal,
	TableWrapper,
}: MigrationsCommissionsContentProps ) {
	if ( isLoading ) {
		return (
			<>
				<TextSkeleton length={ 30 } />
				<TextSkeleton length={ 30 } />
			</>
		);
	}

	return (
		<>
			{ taggedSites.length === 0 ? (
				<MigrationsCommissionsEmptyState
					recordTracksEvent={ recordTracksEvent }
					onTagSitesClick={ onOpenAddSitesModal }
					canTagSitesForCommission={ canTagSitesForCommission }
				/>
			) : (
				<VStack spacing={ 6 }>
					{ canTagSitesForCommission && (
						<MigrationsConsolidatedCommissions items={ taggedSites } />
					) }
					<MigrationsCommissionsList
						items={ taggedSites }
						migrationTags={ migrationTags }
						recordTracksEvent={ recordTracksEvent }
						onSuccess={ onSuccess }
						onError={ onError }
						locale={ locale }
						TableWrapper={ TableWrapper }
					/>
				</VStack>
			) }
			{ isAddSitesModalOpen && (
				<MigrationsTagSitesModal
					onClose={ onCloseAddSitesModal }
					taggedSites={ taggedSites }
					migrationTags={ migrationTags }
					recordTracksEvent={ recordTracksEvent }
					onSuccess={ onSuccess }
					onError={ onError }
					getSiteCreatedAt={ getSiteCreatedAt }
					locale={ locale }
				/>
			) }
		</>
	);
}
