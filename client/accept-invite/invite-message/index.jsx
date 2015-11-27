/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import SimpleNotice from 'notices/simple-notice'
import { dismissInviteAccepted, dismissInviteDeclined } from 'accept-invite/actions'
import store from 'accept-invite/invite-message/store'

export default React.createClass( {

	getInitialState: function() {
		return store.get();
	},

	componentWillMount() {
		store.on( 'change', () => this.setState( this.getInitialState ) );
	},

	componentWillUnmount() {
		store.off( 'change', () => this.setState( this.getInitialState ) );
	},

	render() {
		if ( ! this.props.sites ) {
			return null;
		}
		const { accepted, declined, siteId } = this.state;
		if ( accepted ) {
			const site = this.props.sites.getSite( siteId );
			if ( ! site ) {
				return null;
			}
			return (
				<SimpleNotice status="is-success" onClick={ dismissInviteAccepted }>
					<h3 className="invite-message__title">{ this.translate( 'You\'re now a user of: %(site)s', { args: { site: site.slug } } ) }</h3>
					<p className="invite-message__intro">
						{ this.translate( 'This is your site dashboard where you can write posts and control your site. ' ) }
					</p>
					<p className="invite-message__intro">
						{
							this.translate(
								'Since you\'re new, you might like to {{docsLink}}take a tour{{/docsLink}}.',
								{ components: { docsLink: <a href="http://en.support.wordpress.com/" target="_blank" /> } }
							)
						}
					</p>
				</SimpleNotice>
			);
		}
		if ( declined ) {
			return (
				<SimpleNotice status="is-success" onClick={ dismissInviteDeclined }>
					<h3>
						{ this.translate( 'You declined to join' ) }
					</h3>
				</SimpleNotice>
			);
		}
		return null;
	}
} )
