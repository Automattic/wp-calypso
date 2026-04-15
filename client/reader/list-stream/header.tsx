import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import { FediFollowAllButton } from './fedi-follow-button';
import { FollowAllSitesButton } from './follow-all-sites-button';
import { ListTags } from './list-tags';
import { downloadListOpml } from './opml-export';
import type { PublicListItem } from './use-public-list-query';

interface ListStreamHeaderProps {
	isPublic?: boolean;
	title: React.ReactNode;
	listTitle?: string;
	slug?: string;
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
	listTitle,
	slug,
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
					<div className="list-stream__header-edit-link">
						<a href={ editUrl }>{ translate( 'Edit list' ) }</a>
					</div>
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
					<>
						<FollowAllSitesButton
							items={ items }
							followSource="reader-list-header"
							showSubscribeToList={ showFollow }
							isSubscribedToList={ following }
							onSubscribeToggle={ onFollowToggle }
						/>
						<FediFollowAllButton items={ items } listSlug={ slug || '' } />
						<Button
							variant="secondary"
							icon={ download }
							onClick={ () =>
								downloadListOpml( listTitle || 'Reader List', slug || 'list', items )
							}
						>
							{ translate( 'OPML' ) }
						</Button>
					</>
				) }
			</NavigationHeader>
			<ListTags tags={ tags } />
		</AutoDirection>
	);
};

export default ListStreamHeader;
