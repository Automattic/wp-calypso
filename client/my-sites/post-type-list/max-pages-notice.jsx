/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './max-pages-notice.scss';

class PostTypeListMaxPagesNotice extends Component {
	static propTypes = {
		displayedPosts: PropTypes.number,
		totalPosts: PropTypes.number,
	};

	UNSAFE_componentWillMount() {
		this.props.recordTracksEvent( 'calypso_post_type_list_max_pages_view' );
	}

	focusSiteSelector = ( event ) => {
		event.preventDefault();

		this.props.setLayoutFocus( 'sites' );
	};

	render() {
		const { displayedPosts, totalPosts, translate } = this.props;

		return (
			<div className="post-type-list__max-pages-notice">
				{ translate(
					'Showing %(displayedPosts)d post of %(totalPosts)d.',
					'Showing %(displayedPosts)d posts of %(totalPosts)d.',
					{
						args: {
							displayedPosts,
							totalPosts,
						},
					}
				) }
				<br />
				{ translate( 'To view more posts, {{a}}switch to a specific site{{/a}}.', {
					components: {
						a: (
							/* eslint-disable jsx-a11y/anchor-is-valid,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
							<a
								className="post-type-list__max-pages-notice-link"
								onClick={ this.focusSiteSelector }
							/>
							/* eslint-enable jsx-a11y/anchor-is-valid,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
						),
					},
				} ) }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, setLayoutFocus } )(
	localize( PostTypeListMaxPagesNotice )
);
