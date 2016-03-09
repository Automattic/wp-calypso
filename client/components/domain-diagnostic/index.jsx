/**
 * External dependencies
 */
import React from 'react';

import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export default React.createClass( {

	displayName: 'DomainDiagnostic',

	propTypes: {
		domain: React.PropTypes.string.isRequired,
	},
	getInitialState: function() {
		return {
			domainDidFail: false
		};
	},

	componentDidMount() {
		const self = this;
		const imageChecker = new Image();
		imageChecker.onerror = function() {
			self.setState( { domainDidFail: true } );
		}
		imageChecker.src = 'http://' + this.props.domain + '/w32.gif';
	},

	render() {
		if ( this.state.domainDidFail ) {
			return (
				<Notice status={ 'is-warning' } showDismiss={ false } text={ 'There seems to be a problem with your "' + this.props.domain + '" domain. Do not panic! Our Domain Helper tool awaits!' }>
					<NoticeAction external={ true } href={ 'https://en.support.wordpress.com/domain-helper/' } />
				</Notice>
			);
		} else {
			return null;
		}
	}
} );
