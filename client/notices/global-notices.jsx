/**
 * External Dependencies
 */
import React from 'react';
import classNames from 'classnames';
import debugModule from 'debug';
import { connect } from 'react-redux';
import noticeActionCreators from 'state/notices/actionCreators'

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
const debug = debugModule( 'calypso:global-notices' );

const GlobalNotices = React.createClass( {

	propTypes: {
		id: React.PropTypes.string,
		forcePinned: React.PropTypes.bool
	},

	getInitialState() {
		return { pinned: this.props.forcePinned };
	},

	componentDidMount() {
		if ( ! this.props.forcePinned ) {
			window.addEventListener( 'scroll', this.updatePinnedState );
		}
	},

	componentDidUpdate( prevProps ) {
		if ( this.props.forcePinned && ! prevProps.forcePinned ) {
			window.removeEventListener( 'scroll', this.updatePinnedState );
			this.setState( { pinned: true } );
		} else if ( ! this.props.forcePinned && prevProps.forcePinned ) {
			window.addEventListener( 'scroll', this.updatePinnedState );
			this.updatePinnedState();
		}
	},

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.updatePinnedState );
	},

	updatePinnedState() {
		this.setState( { pinned: window.scrollY > 0 } );
	},

	render() {
		const noticesList = this.props.notices.map( function( notice, index ) {
				return (
					<Notice
						key={ 'notice-' + index }
						status={ notice.status }
						showDismiss={ notice.showDismiss }
						onDismissClick={ this.props.removeNotice.bind( this, notice.noticeId ) }
						text={ notice.text }>
					</Notice>
				);
			}, this );

		if ( ! this.props.notices.length ) {
			return null;
		}
		return (
			<div>
				<div id={ this.props.id } className={ classNames( 'notices-list', { 'is-pinned': this.state.pinned } ) }>
					{ noticesList }
				</div>
				{ this.state.pinned && ! this.props.forcePinned
					? <div className="notices-list__whitespace" />
					: null }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			notices: state.notices.items
		};
	},
	noticeActionCreators
)( GlobalNotices );
