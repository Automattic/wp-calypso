import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { removeNotice } from 'calypso/state/notices/actions';
import { getNotices } from 'calypso/state/notices/selectors';
import GlobalNoticesContainer from './container';

export class GlobalNotices extends Component {
	removeReduxNotice = ( noticeId, onDismissClick ) => {
		return ( e ) => {
			if ( onDismissClick ) {
				onDismissClick( e );
			}
			this.props.removeNotice( noticeId );
		};
	};

	render() {
		const noticesList = this.props.storeNotices.map(
			// We'll rest/spread props to notice so arbitrary props can be passed to `Notice`.
			// Be sure to destructure any props that aren't for at `Notice`, e.g. `button`.
			function ( { button, href, noticeId, onClick, onDismissClick, ...notice } ) {
				return (
					<Notice
						{ ...notice }
						key={ `notice-${ noticeId }` }
						onDismissClick={ this.removeReduxNotice( noticeId, onDismissClick ) }
						theme="dark"
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
		);

		if ( ! noticesList.length ) {
			return null;
		}

		return <GlobalNoticesContainer id={ this.props.id }>{ noticesList }</GlobalNoticesContainer>;
	}

	static propTypes = {
		id: PropTypes.string,

		// Connected props
		removeNotice: PropTypes.func.isRequired,
		storeNotices: PropTypes.array.isRequired,
	};

	static defaultProps = {
		id: 'overlay-notices',
	};
}

export default connect(
	( state ) => ( {
		storeNotices: getNotices( state ),
	} ),
	{ removeNotice }
)( GlobalNotices );
