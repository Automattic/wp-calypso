/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import notices from 'notices';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { getNotices } from 'state/notices/selectors';
import { removeNotice } from 'state/notices/actions';
import GlobalNoticesContainer from './container';

export class GlobalNotices extends Component {
	update = () => {
		this.forceUpdate();
	};

	componentDidMount() {
		if ( this.props.notices ) {
			this.props.notices.on( 'change', this.update );
		}
	}

	componentWillUnmount() {
		if ( this.props.notices ) {
			this.props.notices.off( 'change', this.update );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.notices !== prevProps.notices ) {
			// unbind the change event from the previous property instance
			if ( prevProps.notices ) {
				prevProps.notices.off( 'change', this.update );
			}

			// bind the change event for the next property instance
			if ( this.props.notices ) {
				this.props.notices.on( 'change', this.update );
			}
		}
	}

	removeNoticeStoreNotice = ( notice ) => () => {
		if ( notice ) {
			notices.removeNotice( notice );
		}
	};

	removeReduxNotice = ( noticeId, onDismissClick ) => {
		return ( e ) => {
			if ( onDismissClick ) {
				onDismissClick( e );
			}
			this.props.removeNotice( noticeId );
		};
	};

	render() {
		const noticesRaw = this.props.notices[ this.props.id ] || [];
		let noticesList = noticesRaw.map( function ( notice, index ) {
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
				function ( { button, href, noticeId, onClick, onDismissClick, ...notice } ) {
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
	}

	static propTypes = {
		id: PropTypes.string,
		notices: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),

		// Connected props
		removeNotice: PropTypes.func.isRequired,
		storeNotices: PropTypes.array.isRequired,
	};

	static defaultProps = {
		id: 'overlay-notices',
		notices: Object.freeze( [] ),
	};
}

export default connect(
	( state ) => ( {
		storeNotices: getNotices( state ),
	} ),
	{ removeNotice }
)( GlobalNotices );
