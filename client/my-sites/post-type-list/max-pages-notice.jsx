/**
 * External dependencies
 *
 * @format
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
					'%(displayedPosts)d of %(totalPosts)d posts shown' +
						'{{br/}}to view more posts, {{a}}switch to a specific site{{/a}}.',
					{
						args: {
							displayedPosts,
							totalPosts,
						},
						components: {
							a: (
								<a
									className="post-type-list__max-pages-notice-link"
									onClick={ this.focusSiteSelector }
								/>
							),
							br: <br />,
						},
					}
				) }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, setLayoutFocus } )(
	localize( PostTypeListMaxPagesNotice )
);
