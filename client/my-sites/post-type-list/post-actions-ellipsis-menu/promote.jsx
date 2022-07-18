import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { bumpStat as bumpAnalyticsStat } from 'calypso/state/analytics/actions';
import { getPost, getPostPreviewUrl } from 'calypso/state/posts/selectors';
import { isSitePreviewable } from 'calypso/state/sites/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { setPreviewUrl } from 'calypso/state/ui/preview/actions';
import { bumpStatGenerator } from './utils';

class PostActionsEllipsisMenuPromote extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		isPreviewable: PropTypes.bool,
		previewUrl: PropTypes.string,
		setPreviewUrl: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		globalId: '',
		status: 'draft',
		isPreviewable: false,
		previewUrl: '',
	};

	promotePost = ( event ) => {
		const { isPreviewable, previewUrl, siteId, postId } = this.props;
		this.props.bumpStat();
		// this.props.setPreviewUrl( 'http://localhost:3004', siteId );
		//this.props.setLayoutFocus( 'preview' );

		/*window.open(
			'http://localhost:3004',
			'popUpWindow',
			'height=800,width=900,left=500,top=100,resizable=no,scrollbars=no,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
		);*/

		window.BlazePress.render( {
			// apiHost: 'https://public-api.wordpress.com',
			apiHost: 'http://localhost:3003',
			// apiPrefix: `/wpcom/v2/sites/${ this.props.siteId }/wordads/dsp`,
			apiPrefix: ``,
			authToken: 'dev-test-token-user-1',
			stripeKey:
				'pk_test_51LAip3HQRXl8YKdespjL2eE9m5uGQrYPl7BWiRJQZ56ID1RBQQH323DgoUiRQg9uG4YZQiag3K7hvuDEjq8pxStW00hVJazNi6',
			template: 'article',
			urn: `urn:wpcom:post:${ siteId }:${ postId }`,
		} );

		if ( ! window.BlazePress ) {
			console.error( 'React code not injected' );
			// return;
		}
		// when the user clicks widget-button, open the widget
		/*window.BlazePress.render( {
			apiHost: 'http://localhost:3003',
			authToken: 'dev-test-token-user-1',
			stripeKey:
				'pk_test_51LAip3HQRXl8YKdespjL2eE9m5uGQrYPl7BWiRJQZ56ID1RBQQH323DgoUiRQg9uG4YZQiag3K7hvuDEjq8pxStW00hVJazNi6',
			// apiPrefix: "/wpcom/v2/sites/1234/wordads/dsp",
			template: 'article',
			urn: 'urn:wpcom:post:204093422:189',
		} );*/
		event.preventDefault();
	};
	componentWillMount() {
		const script = document.createElement( 'script' );
		script.src = 'http://localhost:3004/widget.js';
		script.async = true;
		document.body.appendChild( script );
	}

	render() {
		const { translate, status, previewUrl, isPreviewable } = this.props;
		if ( ! previewUrl ) {
			return null;
		}

		return (
			<>
				<PopoverMenuItem
					href={ previewUrl }
					onClick={ this.promotePost }
					icon={ 'speaker' }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ [ 'publish', 'private' ].includes( status )
						? translate( 'Promote', { context: 'verb' } )
						: translate( 'Promote', { context: 'verb' } ) }
				</PopoverMenuItem>
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
		postId: post.ID,
		siteId: post.site_ID,
		status: post.status,
		type: post.type,
		isPreviewable: false !== isSitePreviewable( state, post.site_ID ),
		previewUrl: getPostPreviewUrl( state, post.site_ID, post.ID ),
	};
};

const mapDispatchToProps = {
	setPreviewUrl,
	setLayoutFocus,
	bumpAnalyticsStat,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator( stateProps.type, 'view', dispatchProps.bumpAnalyticsStat );
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuPromote ) );
