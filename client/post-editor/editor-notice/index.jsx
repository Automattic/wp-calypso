/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import NoticeAction from 'components/notice/notice-action';
import Notice from 'components/notice';

export default React.createClass( {
	displayName: 'EditorNotice',

	mixins: [ PureRenderMixin ],

	propTypes: {
		type: PropTypes.string,
		link: PropTypes.string,
		action: PropTypes.string,
		layoutFocus: PropTypes.object.isRequired,
		onDismissClick: PropTypes.func
	},

	getDefaultProps() {
		return {
			text: null,
			onDismissClick: noop
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.text && nextProps.text ) {
			// If we are showing a notice that didn't exist before, switch to the main editor view to show it
			this.props.layoutFocus.set( 'content' );
		}
	},

	render() {
		let arrowLink;

		if ( ! this.props.text ) {
			return null;
		}

		if ( this.props.link ) {
			arrowLink = (
				<NoticeAction href={ this.props.link } external={ true }>
					{ this.props.action }
				</NoticeAction>
			);
		}

		return (
			<Notice
				status={ 'is-' + this.props.type }
				showDismiss={ this.props.type !== 'success' }
				onDismissClick={ this.props.onDismissClick }
				className="post-editor-notice"
				text={ this.props.text }>
				{ arrowLink }
			</Notice>
		);
	}

} );
