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
import Notice from 'client/components/notice';
import NoticeAction from 'client/components/notice/notice-action';
import notices from 'client/notices';
import observe from 'client/lib/mixins/data-observe';
import { connect } from 'react-redux';
import { removeNotice } from 'client/state/notices/actions';
import { getNotices } from 'client/state/notices/selectors';

const debug = debugModule( 'calypso:notices' );

const NoticesList = createReactClass( {
	displayName: 'NoticesList',

	mixins: [ observe( 'notices' ) ],

	propTypes: {
		id: PropTypes.string,
		notices: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),
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

	removeNotice( notice ) {
		if ( notice ) {
			notices.removeNotice( notice );
		}
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
					onDismissClick={ this.removeNotice.bind( this, notice ) }
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
			this.props.storeNotices.map( function( notice ) {
				return (
					<Notice
						key={ 'notice-' + notice.noticeId }
						status={ notice.status }
						duration={ notice.duration || null }
						showDismiss={ notice.showDismiss }
						onDismissClick={ this.props.removeNotice.bind( this, notice.noticeId ) }
						text={ notice.text }
					>
						{ notice.button && (
							<NoticeAction href={ notice.href } onClick={ notice.onClick }>
								{ notice.button }
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
	state => {
		return {
			storeNotices: getNotices( state ),
		};
	},
	{ removeNotice }
)( NoticesList );
