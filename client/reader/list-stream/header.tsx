import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import { FollowAllSitesButton } from './follow-all-sites-button';
import { ListTags } from './list-tags';
import type { PublicListItem } from './use-public-list-query';

interface ListStreamHeaderProps {
	isPublic?: boolean;
	title: React.ReactNode;
	description?: string;
	showEdit?: boolean;
	editUrl?: string;
	showFollow?: boolean;
	following?: boolean;
	onFollowToggle?: ( isFollowRequested: boolean ) => void;
	tags?: string[];
	items?: PublicListItem[];
}

const ListStreamHeader = ( {
	isPublic,
	title,
	description,
	showEdit,
	editUrl,
	showFollow,
	following,
	onFollowToggle,
	tags,
	items,
}: ListStreamHeaderProps ) => {
	const translate = useTranslate();

	const formattedTitle = (
		<AutoDirection>
			<div>{ title }</div>
		</AutoDirection>
	);

	const formattedDescription = (
		<AutoDirection>
			<div>
				{ description }
				{ showEdit && editUrl && (
					<>
						{ ' ' }
						<a className="list-stream__header-edit-link" href={ editUrl }>
							{ translate( 'Edit list' ) }
						</a>
					</>
				) }
			</div>
		</AutoDirection>
	);

	return (
		<AutoDirection>
			<NavigationHeader title={ formattedTitle } subtitle={ formattedDescription }>
				{ ! isPublic && (
					<div className="list-stream__header-title-privacy">
						<Gridicon icon="lock" size={ 24 } title={ translate( 'Private list' ) } />
					</div>
				) }

				{ items && items.length > 0 && (
					<FollowAllSitesButton
						items={ items }
						followSource="reader-list-header"
						showSubscribeToList={ showFollow }
						isSubscribedToList={ following }
						onSubscribeToggle={ onFollowToggle }
					/>
				) }
			</NavigationHeader>
			<ListTags tags={ tags } />
		</AutoDirection>
	);
};

export default ListStreamHeader;
