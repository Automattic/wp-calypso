/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export default React.createClass( {

	imageChecker: null,

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
		this.imageChecker = new Image();
		this.imageChecker.onerror = function() {
			if ( self.isMounted() ) {
				self.setState( { domainDidFail: true } );
			}
		}
		this.imageChecker.src = 'http://' + this.props.domain + '/w32.gif';
	},

	componentWillUnmount() {
		this.imageChecker = null;
	},

	render() {
		if ( this.state.domainDidFail ) {
			return (
				<Notice status={ 'is-warning' } showDismiss={ false } text={ 'There seems to be a problem with your "' + this.props.domain + '" domain. Do not panic! Our Domain Helper tool awaits!' }>
					<NoticeAction external={ true } href={ 'https://en.support.wordpress.com/domain-helper/?host=' + this.props.domain } />
				</Notice>
			);
		} else {
			return null;
		}
	}
} );
