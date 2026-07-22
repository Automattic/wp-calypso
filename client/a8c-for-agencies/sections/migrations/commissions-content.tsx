import { TextSkeleton } from 'calypso/dashboard/components/text-skeleton';
import MigrationsCommissionsList from './commissions-list';
import MigrationsConsolidatedCommissions from './consolidated-commissions';
import MigrationsCommissionsEmptyState from './primary/migrations-commissions/empty-state';
import MigrationsTagSitesModal from './tag-sites-modal';
import type { RecordTracksEvent, ShowSuccessNotice, TaggedSite } from './types';
import type { ReactNode } from 'react';

interface MigrationsCommissionsContentProps {
	taggedSites: TaggedSite[];
	isLoading: boolean;
	recordTracksEvent: RecordTracksEvent;
	onSuccess: ShowSuccessNotice;
	onError: ( message: ReactNode ) => void;
	getSiteCreatedAt: ( blogId: number ) => string | undefined;
	canTagSitesForCommission: boolean;
	migrationTags: string[];
	isAddSitesModalOpen: boolean;
	onCloseAddSitesModal: () => void;
	onOpenAddSitesModal: () => void;
}

export default function MigrationsCommissionsContent( {
	taggedSites,
	isLoading,
	recordTracksEvent,
	onSuccess,
	onError,
	getSiteCreatedAt,
	canTagSitesForCommission,
	migrationTags,
	isAddSitesModalOpen,
	onCloseAddSitesModal,
	onOpenAddSitesModal,
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
				<div className="migrations-commissions__content">
					{ canTagSitesForCommission && (
						<MigrationsConsolidatedCommissions items={ taggedSites } />
					) }
					<MigrationsCommissionsList
						items={ taggedSites }
						migrationTags={ migrationTags }
						recordTracksEvent={ recordTracksEvent }
						onSuccess={ onSuccess }
						onError={ onError }
					/>
				</div>
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
				/>
			) }
		</>
	);
}
