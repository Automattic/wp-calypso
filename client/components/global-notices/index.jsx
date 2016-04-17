/**
 * External Dependencies
 */
import React from 'react';
import debugModule from 'debug';
import find from 'lodash/find';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import notices from 'notices';
import observe from 'lib/mixins/data-observe';
import { connect } from 'react-redux';
import { removeNotice } from 'state/notices/actions';

const debug = debugModule( 'calypso:notices' );

const NoticesList = React.createClass( {

	displayName: 'NoticesList',

	mixins: [ observe( 'notices' ) ],

	propTypes: {
		id: React.PropTypes.string,
		notices: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.array
		] ),
		storeNotices: React.PropTypes.array,
		removeNotice: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			id: 'overlay-notices',
			notices: Object.freeze( [] )
		};
	},

	componentWillMount() {
		debug( 'Mounting Global Notices React component.' );
	},

	handleOldDismissClick( noticeId ) {
		const noticesRaw = this.props.notices[ this.props.id ] || [];
		const notice = find( noticesRaw, { noticeId } );

		if ( notice ) {
			notices.removeNotice( notice );
		}
	},

	render() {
		const noticesRaw = this.props.notices[ this.props.id ] || [];
		let noticesList = noticesRaw.map( ( notice ) => {
			return (
				<Notice
					noticeId={ notice.noticeId }
					key={ 'notice-old-' + notice.noticeId }
					status={ notice.status }
					duration={ notice.duration }
					text={ notice.text }
					isCompact={ notice.isCompact }
					onDismissClick={ this.handleOldDismissClick }
					showDismiss={ notice.showDismiss }
				>
				{ notice.button &&
					<NoticeAction
						href={ notice.href }
						onClick={ notice.onClick }
					>
						{ notice.button }
					</NoticeAction>
				}
				</Notice>
			);
		} );

		//This is an interim solution for displaying both notices from redux store
		//and from the old component. When all notices are moved to redux store, this component
		//needs to be updated.
		noticesList = noticesList.concat( this.props.storeNotices.map( ( notice ) => {
			return (
				<Notice
					noticeId={ notice.id }
					key={ 'notice-' + notice.id }
					status={ notice.status }
					duration = { notice.duration }
					showDismiss={ notice.showDismiss }
					onDismissClick={ this.props.removeNotice }
					text={ notice.text }
					icon={ notice.icon }
				>
				{ notice.button &&
					<NoticeAction
						href={ notice.href }
						onClick={ notice.onClick }
					>
						{ notice.button }
					</NoticeAction>
				}
				</Notice>
			);
		} ) );

		if ( ! noticesList.length ) {
			return null;
		}

		return (
			<div id={ this.props.id } className="global-notices">
				{ noticesList }
			</div>
		);
	}
} );

export default connect(
	state => {
		return {
			storeNotices: state.notices.items
		};
	},
	{ removeNotice }
)( NoticesList );
