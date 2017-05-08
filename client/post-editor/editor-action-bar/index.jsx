/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import EditorSticky from 'post-editor/editor-sticky';
import utils from 'lib/posts/utils';
import Tooltip from 'components/tooltip';
import Button from 'components/button';
import EditorActionBarViewLabel from './view-label';
import EditorStatusLabel from 'post-editor/editor-status-label';

export default React.createClass( {

	displayName: 'EditorActionBar',

	propTypes: {
		isNew: React.PropTypes.bool,
		onPrivatePublish: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		site: React.PropTypes.object,
		type: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			viewLinkTooltip: false
		};
	},

	render() {
		const multiUserSite = this.props.site && ! this.props.site.single_user_site;

		return (
			<div className="editor-action-bar">
				<div className="editor-action-bar__cell is-left">
					<EditorStatusLabel
						post={ this.props.savedPost }
						advancedStatus
						type={ this.props.type }
					/>
				</div>
				<div className="editor-action-bar__cell is-center">
					{ multiUserSite &&
						<AsyncLoad
							require="post-editor/editor-author"
							post={ this.props.post }
							isNew={ this.props.isNew }
						/>
					}
				</div>
				<div className="editor-action-bar__cell is-right">
					{ this.props.post && this.props.type === 'post' && <EditorSticky /> }
					{ utils.isPublished( this.props.savedPost ) && (
						<Button
							href={ this.props.savedPost.URL }
							target="_blank"
							rel="noopener noreferrer"
							onMouseEnter={ () => this.setState( { viewLinkTooltip: true } ) }
							onMouseLeave={ () => this.setState( { viewLinkTooltip: false } ) }
							ref="viewLink"
							borderless
						>
							<Gridicon icon="external" />
							<Tooltip
								className="editor-action-bar__view-post-tooltip"
								context={ this.refs && this.refs.viewLink }
								isVisible={ this.state.viewLinkTooltip }
								position="bottom left"
							>
								<EditorActionBarViewLabel />
							</Tooltip>
						</Button>
					) }
				</div>
			</div>
		);
	}
} );
