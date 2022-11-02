import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPost } from 'calypso/state/posts/selectors';
import PostActionsQRCode from '../../post-actions-qr-code';

class PostActionsEllipsisMenuQRCode extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			showQRCode: false,
		};
	}

	generateQRCode = () => {
		this.setState( { showQRCode: true } );
	};

	render() {
		const { translate, url, status } = this.props;

		// The QR option will be available only for `publish` status
		if ( ! [ 'publish' ].includes( status ) ) {
			return null;
		}

		return (
			<>
				<PopoverMenuItem onClick={ this.generateQRCode } icon="bug">
					{ translate( 'QR Code' ) }
				</PopoverMenuItem>
				<PostActionsQRCode siteUrl={ url } showQRCode={ this.state.showQRCode } />
			</>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		status: post.status,
		url: post.URL,
	};
};

export default connect( mapStateToProps )( localize( PostActionsEllipsisMenuQRCode ) );
