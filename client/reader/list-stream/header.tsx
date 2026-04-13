import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import { isExternal } from 'calypso/lib/url';
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
	onFollowToggle?: () => void;
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
			<div>{ description }</div>
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

				{ showFollow && (
					<div className="list-stream__header-follow">
						<FollowButton
							iconSize={ 24 }
							following={ following }
							onFollowToggle={ onFollowToggle }
						/>
					</div>
				) }

				{ showFollow && items && items.length > 0 && (
					<FollowAllSitesButton items={ items } followSource="reader-list-header" />
				) }

				{ showEdit && editUrl && (
					<div className="list-stream__header-edit">
						<Button rel={ isExternal( editUrl ) ? 'external' : '' } href={ editUrl }>
							{ translate( 'Edit' ) }
						</Button>
					</div>
				) }
			</NavigationHeader>
			<ListTags tags={ tags } />
		</AutoDirection>
	);
};

export default ListStreamHeader;
