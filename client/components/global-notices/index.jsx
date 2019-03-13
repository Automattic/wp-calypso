/** @format */

/**
 * External dependencies
 */
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import GlobalNoticesContainer from './container';
import notices from 'notices';
import observe from 'lib/mixins/data-observe'; // eslint-disable-line no-restricted-imports
import { connect } from 'react-redux';
import { getNotices } from 'state/notices/selectors';
import { removeNotice } from 'state/notices/actions';

// eslint-disable-next-line react/prefer-es6-class
export const GlobalNotices = createReactClass( {
	displayName: 'GlobalNotices',

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

	removeNoticeStoreNotice: notice => () => {
		if ( notice ) {
			notices.removeNotice( notice );
		}
	},

	// Auto-bound by createReactClass.
	// Migrate to arrow => when using class extends React.Component
	removeReduxNotice( noticeId, onDismissClick ) {
		return e => {
			if ( onDismissClick ) {
				onDismissClick( e );
			}
			this.props.removeNotice( noticeId );
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

		// This is an interim solution for displaying both notices from redux store and from the old
		// component. When all notices are moved to redux store, this component needs to be updated.
		noticesList = noticesList.concat(
			this.props.storeNotices.map(
				// We'll rest/spread props to notice so arbitrary props can be passed to `Notice`.
				// Be sure to destructure any props that aren't for at `Notice`, e.g. `button`.
				function( { button, href, noticeId, onClick, onDismissClick, ...notice } ) {
					return (
						<Notice
							{ ...notice }
							key={ `notice-${ noticeId }` }
							onDismissClick={ this.removeReduxNotice( noticeId, onDismissClick ) }
						>
							{ button && (
								<NoticeAction href={ href } onClick={ onClick }>
									{ button }
								</NoticeAction>
							) }
						</Notice>
					);
				},
				this
			)
		);

		if ( ! noticesList.length ) {
			return null;
		}

		return <GlobalNoticesContainer id={ this.props.id }>{ noticesList }</GlobalNoticesContainer>;
	},
} );

export default connect(
	state => ( {
		storeNotices: getNotices( state ),
	} ),
	{ removeNotice }
)( GlobalNotices );
