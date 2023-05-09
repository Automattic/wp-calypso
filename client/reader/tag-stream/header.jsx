import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';

class TagStreamHeader extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		showFollow: PropTypes.bool,
		following: PropTypes.bool,
		onFollowToggle: PropTypes.func,
		showBack: PropTypes.bool,
	};

	render() {
		const { title, isPlaceholder, showFollow, following, onFollowToggle, translate, showBack } =
			this.props;
		const classes = classnames( {
			'tag-stream__header': true,
			'is-placeholder': isPlaceholder,
			'has-back-button': showBack,
		} );

		return (
			<div className={ classes }>
				<h1 className="tag-stream__header-title">{ title }</h1>
				<div className="tag-stream__header-follow">
					{ showFollow && (
						<FollowButton
							followLabel={ translate( 'Follow tag' ) }
							followingLabel={ translate( 'Following tag' ) }
							iconSize={ 24 }
							following={ following }
							onFollowToggle={ onFollowToggle }
							followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
							followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
						/>
					) }
				</div>
			</div>
		);
	}
}

export default connect( null, null )( localize( TagStreamHeader ) );
