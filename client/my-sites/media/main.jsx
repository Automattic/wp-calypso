/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import observe from 'lib/mixins/data-observe';
import Dialog from 'components/dialog';
import MediaModalDetail from 'post-editor/media-modal/detail';

export default React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			editedItem: null
		};
	},

	componentDidMount: function() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth
		} );
	},

	onFilterChange: function( filter ) {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.sites.selected ) {
			redirect += '/' + this.props.sites.selected;
		}

		page( redirect );
	},

	openDetailsModal( item ) {
		this.setState( { editedItem: item } );
	},

	closeDetailsModal() {
		this.setState( { editedItem: null } );
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ this.state.editedItem &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal"
						onClickOutside={ this.closeDetailsModal }
						onClose={ this.closeDetailsModal }
					>
						<MediaModalDetail
							site={ site }
							items={ [ this.state.editedItem ] }
							selectedIndex={ 0 }
							onChangeView={ this.closeDetailsModal }
						/>
					</Dialog>
				}
				<MediaLibrary
					{ ...this.props }
					onFilterChange={ this.onFilterChange }
					site={ site }
					onEditItem={ this.openDetailsModal }
					containerWidth={ this.state.containerWidth } />
			</div>
		);
	}
} );
