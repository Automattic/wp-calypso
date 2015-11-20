/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import EditorTitle from './';
import sitesList from 'lib/sites-list';

/**
 * Module variables
 */
const sites = sitesList();

export default React.createClass( {
	displayName: 'EditorTitleContainer',

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState() {
		return this.getState();
	},

	componentDidMount() {
		PostEditStore.on( 'change', this.updateState );
		sites.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		PostEditStore.off( 'change', this.updateState );
		sites.off( 'change', this.updateState );
	},

	getState() {
		return {
			post: PostEditStore.get(),
			site: sites.getSelectedSite() || null,
			isNew: PostEditStore.isNew()
		};
	},

	updateState() {
		this.setState( this.getState() );
	},

	render() {
		return <EditorTitle { ...this.props } { ...this.state } />
	}
} );
