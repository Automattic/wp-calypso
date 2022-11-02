import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPost } from 'calypso/state/posts/selectors';

class PostActionsEllipsisMenuQRCode extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		status: PropTypes.string,
	};

	generateQRCode = () => {};

	render() {
		const { translate } = this.props;

		return (
			<PopoverMenuItem onClick={ this.generateQRCode } icon="bug">
				{ translate( 'QR Code' ) }
			</PopoverMenuItem>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		siteId: post.site_ID,
		status: post.status,
		type: post.type,
		url: post.url,
	};
};

export default connect( mapStateToProps )( localize( PostActionsEllipsisMenuQRCode ) );
