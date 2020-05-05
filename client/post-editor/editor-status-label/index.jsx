/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import * as postUtils from 'state/posts/utils';
import EditorStatusLabelPlaceholder from './placeholder';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, isEditorNewPost } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class EditorStatusLabel extends React.Component {
	static propTypes = {
		post: PropTypes.object,
	};

	state = {
		currentTime: Date.now(),
	};

	componentDidMount() {
		// update the `currentTime` every minute
		this.currentTimeTimer = setInterval( this.updateCurrentTime, 60000 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
		if ( ! this.props.post && ! this.props.isNew ) {
			return <EditorStatusLabelPlaceholder className="editor-status-label" />;
		}

		const className = classNames(
			'editor-status-label',
			'is-plain',
			'is-' + get( this.props.post, 'status', 'draft' )
		);

		return <span className={ className }>{ this.renderLabel() }</span>;
	}

	renderLabel() {
		const { isNew, post, translate, moment } = this.props;

		if ( isNew ) {
			return translate( 'New Draft' );
		}

		let editedTime = moment( postUtils.getEditedTime( post ) );

		// prevent JP sites from showing a draft as saved in the future
		if ( 'draft' === post.status && editedTime.isAfter( this.state.currentTime ) ) {
			editedTime = moment( this.state.currentTime );
		}

		const timeFromNow = editedTime.from( this.state.currentTime );

		switch ( post.status ) {
			case 'publish':
				return translate( '{{strong}}Published{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />,
					},
				} );
			case 'private':
				return translate( '{{strong}}Published Privately{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />,
					},
				} );
			case 'draft':
				return translate( '{{strong}}Saved{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />,
					},
				} );
			case 'pending':
				return translate( '{{strong}}Pending Review{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />,
					},
				} );
			case 'future':
				return translate( '{{strong}}Scheduled{{/strong}} %(relativeTimeFromNow)s', {
					args: { relativeTimeFromNow: timeFromNow },
					components: {
						strong: <strong />,
					},
				} );
			case 'trash':
				return translate( '{{strong}}Trashed{{/strong}}', {
					components: {
						strong: <strong />,
					},
				} );
		}

		return '';
	}

	updateCurrentTime = () => {
		this.setState( {
			currentTime: Date.now(),
		} );
	};
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const post = getSitePost( state, siteId, postId );
	const isNew = isEditorNewPost( state );

	return { isNew, post };
} )( localize( withLocalizedMoment( EditorStatusLabel ) ) );
