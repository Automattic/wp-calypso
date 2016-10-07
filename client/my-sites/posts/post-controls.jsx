/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import url from 'url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import utils from 'lib/posts/utils';
import Gridicon from 'components/gridicon';
import { ga } from 'lib/analytics';

class PostControls extends PureComponent {

	static propTypes = {
		post: PropTypes.object.isRequired,
		editURL: PropTypes.string.isRequired,
		onShowMore: PropTypes.func.isRequired,
		onHideMore: PropTypes.func.isRequired,
		onPublish: PropTypes.func,
		onTrash: PropTypes.func,
		onDelete: PropTypes.func,
		onRestore: PropTypes.func,
		translate: PropTypes.func,
	};

	view() {
		ga.recordEvent( 'Posts', 'Clicked View Post' );
	}

	preview() {
		ga.recordEvent( 'Posts', 'Clicked Preview Post' );
	}

	edit() {
		ga.recordEvent( 'Posts', 'Clicked Edit Post' );
	}

	viewStats() {
		ga.recordEvent( 'Posts', 'Clicked View Post Stats' );
	}

	getControlElements( controls ) {
		return controls.map( ( control, i ) => {
			return (
				<li key={ `controls-${ this.props.post.ID }-${ i }` }>
					<a
						href={ control.href }
						className={ `post-controls__${ control.className }` }
						onClick={ control.onClick }
						target={ control.target ? control.target : null }
					>
						<Gridicon icon={ control.icon } size={ 18 } />
						<span>
							{ control.text }
						</span>
					</a>
				</li>
			);
		} );
	}

	getAvailableControls() {
		const { post, translate } = this.props;
		const controls = {
			main: [],
			more: [],
		};

		// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
		// and those posts will not have access to post management type controls

		// Main Controls (not behind ... more link)
		if ( utils.userCan( 'edit_post', post ) ) {
			controls.main.push( {
				text: translate( 'Edit' ),
				className: 'edit',
				href: this.props.editURL,
				onClick: this.edit,
				icon: 'pencil',
			} );
		}

		if ( 'publish' === post.status ) {
			controls.main.push( {
				text: translate( 'View' ),
				className: 'view',
				href: post.URL,
				target: '_blank',
				onClick: this.view,
				icon: 'external',
			} );

			let statsUrl;
			if ( config.isEnabled( 'manage/stats' ) ) {
				statsUrl = `/stats/post/${ post.ID }/${ this.props.site.slug }`;
			} else {
				statsUrl = `//wordpress.com/my-stats/?view=post&post=${ post.ID }&blog=${ post.site_ID }`;
			}
			controls.main.push( {
				text: translate( 'Stats' ),
				className: 'stats',
				href: statsUrl,
				onClick: this.viewStats,
				icon: 'stats-alt',
			} );
		} else if ( 'trash' !== post.status ) {
			const parsedUrl = url.parse( post.URL, true );
			parsedUrl.query.preview = 'true';
			// NOTE: search needs to be cleared in order to rebuild query
			// http://nodejs.org/api/url.html#url_url_format_urlobj
			parsedUrl.search = '';
			controls.main.push( {
				text: translate( 'Preview' ),
				className: 'view',
				href: url.format( parsedUrl ),
				target: '_blank',
				onClick: this.preview,
				icon: 'external',
			} );

			if ( utils.userCan( 'publish_post', post ) ) {
				controls.main.push( {
					text: translate( 'Publish' ),
					className: 'publish',
					onClick: this.props.onPublish,
					icon: 'reader',
				} );
			}
		} else if ( utils.userCan( 'delete_post', post ) ) {
			controls.main.push( {
				text: translate( 'Restore' ),
				className: 'restore',
				onClick: this.props.onRestore,
				icon: 'undo',
			} );
		}

		if ( utils.userCan( 'delete_post', post ) ) {
			if ( 'trash' === post.status ) {
				controls.main.push( {
					text: translate( 'Delete Permanently' ),
					className: 'trash is-scary',
					onClick: this.props.onDelete,
					icon: 'trash',
				} );
			} else {
				controls.main.push( {
					text: translate( 'Trash' ),
					className: 'trash',
					onClick: this.props.onTrash,
					icon: 'trash',
				} );
			}
		}

		// More Controls (behind ... more link)
		if ( ( controls.main.length > 2 && ! this.props.fullWidth ) || ( controls.main.length > 4 && this.props.fullWidth ) ) {
			const moreControlsSpliceIndex = ( ! this.props.fullWidth ) ? 2 : 4;

			let i;
			for ( i = moreControlsSpliceIndex; i < controls.main.length; i++ ) {
				controls.more.push( controls.main[ i ] );
			}

			controls.main.splice( moreControlsSpliceIndex );
		}

		if ( controls.more.length ) {
			controls.main.push( {
				text: translate( 'More' ),
				className: 'more',
				onClick: this.props.onShowMore,
				icon: 'ellipsis',
			} );

			controls.more.push( {
				text: translate( 'Back' ),
				className: 'back',
				onClick: this.props.onHideMore,
				icon: 'chevron-left',
			} );
		}

		return controls;
	}

	render() {
		const controls = this.getAvailableControls();
		const className = classNames( 'post-controls', {
			'post-controls--desk-nomore': controls.more.length <= 2
		} );

		if ( controls.more.length ) {
			return (
				<div className={ className }>
					<ul className="posts__post-controls post-controls__pane post-controls__more-options">
						{ this.getControlElements( controls.more ) }
					</ul>
					<ul className="posts__post-controls post-controls__pane post-controls__main-options">
						{ this.getControlElements( controls.main ) }
					</ul>
				</div>
			);
		}

		return (
			<div className={ className }>
				<ul className="posts__post-controls post-controls__pane post-controls__main-options">
					{ this.getControlElements( controls.main ) }
				</ul>
			</div>
		);
	}

}

export default localize( PostControls );
