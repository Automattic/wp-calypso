/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import EditorPublishButton from 'post-editor/editor-publish-button';
import Button from 'components/button';

const EditorMobileNavigation = React.createClass( {

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		onTabChange: PropTypes.func,
		onClose: PropTypes.func
	},

	openSidebar: function() {
		if ( 'sidebar' !== this.props.currentLayoutFocus ) {
			this.props.setLayoutFocus( 'sidebar' );
			this.props.onTabChange();
		}
	},

	closeSidebar: function() {
		if ( 'content' !== this.props.currentLayoutFocus ) {
			this.props.setLayoutFocus( 'content' );
			this.props.onTabChange();
		}
	},

	render: function() {
		return (
			<div className="editor-mobile-navigation">
				<div className="editor-mobile-navigation__actions">
					<Button borderless onClick={ this.props.onClose }>
						<Gridicon
							icon="chevron-left"
							className="editor-mobile-navigation__icon" />
					</Button>
					<div className="editor-mobile-navigation__tabs">
						<Button borderless onClick={ this.closeSidebar }>
							<Gridicon
								icon="pencil"
								className={ classnames( 'editor-mobile-navigation__icon', {
									'is-selected': 'content' === this.props.currentLayoutFocus
								} ) } />
						</Button>
						<Button borderless onClick={ this.openSidebar }>
							<Gridicon
								icon="cog"
								className={ classnames( 'editor-mobile-navigation__icon', {
									'is-selected': 'sidebar' === this.props.currentLayoutFocus
								} ) } />
						</Button>
					</div>
				</div>
				<EditorPublishButton
					site={ this.props.site }
					post={ this.props.post }
					savedPost={ this.props.savedPost }
					onSave={ this.props.onSave }
					onPublish={ this.props.onPublish }
					isPublishing={ this.props.isPublishing }
					isSaveBlocked={ this.props.isSaveBlocked }
					hasContent={ this.props.hasContent }
				/>
			</div>
		);
	}
} );

module.exports = connect(
	( state ) => ( { currentLayoutFocus: getCurrentLayoutFocus( state ) } ),
	{ setLayoutFocus }
)( EditorMobileNavigation );
