/**
 * External Dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal Dependencies
 */
import SiteIcon from 'components/site-icon';
import Gravatar from 'components/gravatar';
import SiteStore from 'lib/reader-site-store';
import SiteStoreActions from 'lib/reader-site-store/actions';

const SiteAndAuthorIcon = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		isExternal: React.PropTypes.bool.isRequired,
		user: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		let site;
		const siteId = ! props.isExternal && props.siteId;
		if ( siteId ) {
			site = SiteStore.get( siteId );
			if ( ! site ) {
				SiteStoreActions.fetch( siteId );
			}
		}
		return {
			site: site
		};
	},

	componentDidMount() {
		SiteStore.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		SiteStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps );
		}
	},

	updateState( props ) {
		var newState = this.getStateFromStores( props );
		if ( newState.site !== this.state.site ) {
			this.setState( newState );
		}
	},

	render() {
		let site = this.state.site ? this.state.site.toJS() : {};
		return (
			<div className="reader__site-and-author-icon">
				<SiteIcon site={ site } />
				<Gravatar user={ this.props.user } size={ 24 } />
			</div>
		);
	}
} );

export default SiteAndAuthorIcon;
