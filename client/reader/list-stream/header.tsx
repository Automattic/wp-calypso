import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import { isExternal } from 'calypso/lib/url';

interface ListStreamHeaderProps {
	isPublic?: boolean;
	title: React.ReactNode;
	description?: string;
	showEdit?: boolean;
	editUrl?: string;
	showFollow?: boolean;
	following?: boolean;
	onFollowToggle?: () => void;
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

				{ showEdit && editUrl && (
					<div className="list-stream__header-edit">
						<Button rel={ isExternal( editUrl ) ? 'external' : '' } href={ editUrl }>
							{ translate( 'Edit' ) }
						</Button>
					</div>
				) }
			</NavigationHeader>
		</AutoDirection>
	);
};

export default ListStreamHeader;
