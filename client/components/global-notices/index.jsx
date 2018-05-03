/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import debugModule from 'debug';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import notices from 'notices';
import observe from 'lib/mixins/data-observe';
import { connect } from 'react-redux';
import { removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';

const debug = debugModule( 'calypso:notices' );

export const NoticesList = createReactClass( {
	displayName: 'NoticesList',

	mixins: [ observe( 'notices' ) ],

	propTypes: {
		id: PropTypes.string,
		notices: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),

		// Connected props
		removeNotice: PropTypes.func.isRequired,
		storeNotices: PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			id: 'overlay-notices',
			notices: Object.freeze( [] ),
		};
	},

	componentWillMount() {
		debug( 'Mounting Global Notices React component.' );
	},

	removeNoticeStoreNotice: notice => () => {
		if ( notice ) {
			notices.removeNotice( notice );
		}
	},

	// Auto-bound by createReactClass.
	// Migrate to arrow => when using class extends React.Component
	removeReduxNotice( notice ) {
		return e => {
			if ( notice.onDismissClick ) {
				notice.onDismissClick( e );
			}
			this.props.removeNotice( notice.noticeId );
		};
	},

	render() {
		const noticesRaw = this.props.notices[ this.props.id ] || [];
		let noticesList = noticesRaw.map( function( notice, index ) {
			return (
				<Notice
					key={ 'notice-old-' + index }
					status={ notice.status }
					duration={ notice.duration || null }
					text={ notice.text }
					isCompact={ notice.isCompact }
					onDismissClick={ this.removeNoticeStoreNotice( notice ) }
					showDismiss={ notice.showDismiss }
				>
					{ notice.button && (
						<NoticeAction href={ notice.href } onClick={ notice.onClick }>
							{ notice.button }
						</NoticeAction>
					) }
				</Notice>
			);
		}, this );

		//This is an interim solution for displaying both notices from redux store
		//and from the old component. When all notices are moved to redux store, this component
		//needs to be updated.
		noticesList = noticesList.concat(
			this.props.storeNotices.map( function( { button, href, onClick, ...notice } ) {
				return (
					<Notice
						{ ...notice }
						key={ `notice-${ notice.noticeId }` }
						onDismissClick={ this.removeReduxNotice( notice ) }
					>
						{ button && (
							<NoticeAction href={ href } onClick={ onClick }>
								{ button }
							</NoticeAction>
						) }
					</Notice>
				);
			}, this )
		);

		if ( ! noticesList.length ) {
			return null;
		}

		return (
			<div id={ this.props.id } className="global-notices">
				{ noticesList }
			</div>
		);
	},
} );

export default connect(
	state => ( {
		storeNotices: getNotices( state ),
	} ),
	{ removeNotice }
)( NoticesList );
