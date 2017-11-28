/** @format */

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

class PostTypeListMaxPagesNotice extends Component {
	static propTypes = {
		displayedPosts: PropTypes.number,
		totalPosts: PropTypes.number,
	};

	componentWillMount() {
		this.props.recordTracksEvent( 'calypso_post_type_list_max_pages_view' );
	}

	focusSiteSelector = event => {
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
							<a
								className="post-type-list__max-pages-notice-link"
								onClick={ this.focusSiteSelector }
							/>
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
