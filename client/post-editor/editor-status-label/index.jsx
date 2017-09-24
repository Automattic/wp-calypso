/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import postUtils from 'lib/posts/utils';
import EditorStatusLabelPlaceholder from './placeholder';

class StatusLabel extends PureComponent {

	static propTypes = {
		onClick: PropTypes.func,
		post: PropTypes.object,
		type: PropTypes.string,
		advancedStatus: PropTypes.bool,
	};

	static defaultProps = {
		onClick: null,
		post: null,
		advancedStatus: false,
		type: 'post',
	};

	state = {
		currentTime: Date.now(),
	};

	componentDidMount() {
		// update the `currentTime` every minute
		this.currentTimeTimer = setInterval( this.updateCurrentTime, 60000 );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.post !== this.props.post ) {
			// the post has been updated, so update the current time so that
			// it will be the most up-to-date when re-rendering
			this.updateCurrentTime();
		}
	}

	componentWillUnmount() {
		clearInterval( this.currentTimeTimer );
	}

	render() {
		const { post, translate } = this.props;
		let statusClass = 'editor-status-label';

		if ( ! post ) {
			return <EditorStatusLabelPlaceholder className={ statusClass } />;
		}

		statusClass = classNames( statusClass, 'is-' + post.status );

		if ( ! this.props.onClick ) {
			return (
				<span className={ classNames( statusClass, 'is-plain' ) }>
					{ this.renderLabel() }
				</span>
			);
		}

		return (
			<button
				className={ statusClass }
				onClick={ this.props.onClick }
				ref="statusLabel"
				aria-label={ translate( 'Show advanced status details' ) }
				aria-pressed={ !! this.props.advancedStatus }
				role="alert"
				aria-live="polite"
			>
				<Gridicon icon="cog" size={ 18 } />
				{ this.renderLabel() }
			</button>
		);
	}

	renderLabel() {
		const { moment, post, translate } = this.props;
		let editedTime = moment( postUtils.getEditedTime( post ) );
		let label;

		if ( ! post.modified ) {
			return translate( 'New Draft' );
		}

		// prevent JP sites from showing a draft as saved in the future
		if ( 'draft' === post.status &&
				editedTime.isAfter( this.state.currentTime )
		) {
			editedTime = moment( this.state.currentTime );
		}

		const timeFromNow = editedTime.from( this.state.currentTime );

		switch ( post.status ) {
			case 'publish':
				label = translate( '{{strong}}Published{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'private':
				label = translate( '{{strong}}Published Privately{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'draft':
				label = translate( '{{strong}}Saved{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'pending':
				label = translate( '{{strong}}Pending Review{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'future':
				label = translate( '{{strong}}Scheduled{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />
					}
				} );
				break;
			case 'trash':
				label = translate( '{{strong}}Trashed{{/strong}}', {
					components: {
						strong: <strong />
					}
				} );
				break;
			default:
				label = '';
				break;
		}

		return label;
	}

	updateCurrentTime = () => {
		this.setState( {
			currentTime: Date.now(),
		} );
	}
}

StatusLabel.displayName = 'StatusLabel';

export default localize( StatusLabel );
