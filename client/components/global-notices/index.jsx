/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
import { removeNotice, clickNotice } from 'state/notices/actions';

const debug = debugModule( 'calypso:notices' );

const ANIMATIONS = [
	'fade',
	'fade-left', 'fade-right', 'fade-up', 'fade-down',
	'zoom',
];

const NoticesList = React.createClass( {

	displayName: 'NoticesList',

	mixins: [ observe( 'notices' ) ],

	propTypes: {
		id: PropTypes.string,
		notices: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.array
		] ),
		storeNotices: PropTypes.array,
		removeNotice: PropTypes.func,
		animation: PropTypes.shape( {
			enter: PropTypes.oneOf( ANIMATIONS ),
			leave: PropTypes.oneOf( ANIMATIONS )
		} )
	},

	getDefaultProps() {
		return {
			id: 'overlay-notices',
			notices: Object.freeze( [] ),
			animation: { enter: 'fade', leave: 'fade' }
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
					noticeId={ notice.noticeId }
					key={ 'notice-' + notice.noticeId }
					status={ notice.status }
					duration = { notice.duration }
					showDismiss={ notice.showDismiss }
					onDismissClick={ this.props.removeNotice }
					className={ notice.className }
					text={ notice.text }
					icon={ notice.icon }
				>
				{ notice.button &&
					<NoticeAction
						href={ notice.href }
						onClick={ () => this.props.clickNotice( notice.noticeId ) }
					>
						{ notice.button }
					</NoticeAction>
				}
				</Notice>
			);
		} ) );

		return (
			<div id={ this.props.id } className="global-notices">
				<ReactCSSTransitionGroup
					transitionName={ { enter: `notice-${this.props.animation.enter}-enter`, leave: `notice-${this.props.animation.leave}-leave` } }
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 300 }
				>
				{ noticesList }
				</ReactCSSTransitionGroup>
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
	{ removeNotice, clickNotice }
)( NoticesList );
