import { Gridicon, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FollowButton from 'calypso/blocks/follow-button/button';
import NavigationHeader from 'calypso/components/navigation-header';
import { isExternal } from 'calypso/lib/url';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';

const ListStreamHeader = ( {
	isPublic,
	title,
	description,
	showEdit,
	editUrl,
	showFollow,
	following,
	onFollowToggle,
	translate,
} ) => {
	return (
		<NavigationHeader title={ title } subtitle={ description }>
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
						followIcon={ ReaderFollowFeedIcon( { iconSize: 24 } ) }
						followingIcon={ ReaderFollowingFeedIcon( { iconSize: 24 } ) }
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
	);
};

ListStreamHeader.propTypes = {
	isPublic: PropTypes.bool,
	title: PropTypes.string,
	description: PropTypes.string,
	showEdit: PropTypes.bool,
	editUrl: PropTypes.string,
	showFollow: PropTypes.bool,
	following: PropTypes.bool,
	onFollowToggle: PropTypes.func,
};

export default localize( ListStreamHeader );
