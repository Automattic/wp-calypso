/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { recordTrack } from 'reader/stats';
import { getCurrentUserId } from 'state/current-user/selectors';

const isEven = number => number % 2 === 0;

class FollowingIntro extends React.Component {
	componentDidMount() {
		this.recordRenderTrack();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isNewReader !== nextProps.isNewReader ) {
			this.recordRenderTrack( nextProps );
		}
	}

	recordRenderTrack = ( props = this.props ) => {
		if ( props.isNewReader === true ) {
			// This is incorrect, but keeping the name for consistency.
			// This event is more like `calypso_reader_following_rendered_for_new_reader`.
			recordTrack( 'calypso_reader_following_intro_render' );
		}
		if ( props.isNewReader === true && ! isEven( props.userId ) ) {
			// Added _actual for when a new Reader and odd userid sees the intro card
			recordTrack( 'calypso_reader_following_intro_render_actual' );
		}
	};

	render() {
		const { isNewReader, translate, dismiss, userId } = this.props;
		const linkElement = <a onClick={ this.props.handleManageLinkClick } href="/following/manage" />;

		// Only show the banner to new Readers with an odd user ID (simple A/B test)
		if ( ! isNewReader || ! userId || isEven( userId ) ) {
			return null;
		}

		return (
			<header className="following__intro">
				<QueryPreferences />
				<div className="following__intro-header">
					<div className="following__intro-copy">
						{ translate(
							'{{strong}}Welcome!{{/strong}} Reader is a custom magazine. ' +
								'{{link}}Follow your favorite sites{{/link}} and their latest ' +
								'posts will appear here. {{span}}Read, like, and comment in a ' +
								'distraction-free environment.{{/span}}',
							{
								components: {
									link: linkElement,
									strong: <strong />,
									span: <span className="following__intro-copy-hidden" />,
								},
							}
						) }
					</div>

					<div
						className="following__intro-close"
						onClick={ dismiss }
						title={ translate( 'Close' ) }
						role="button"
						aria-label={ translate( 'Close' ) }
					>
						<Gridicon
							icon="cross-circle"
							className="following__intro-close-icon"
							title={ translate( 'Close' ) }
						/>
						<span className="following__intro-close-icon-bg" />
					</div>
				</div>
			</header>
		);
	}
}

export default connect(
	state => {
		return {
			isNewReader: getPreference( state, 'is_new_reader' ),
			userId: getCurrentUserId( state ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				dismiss: () => {
					recordTrack( 'calypso_reader_following_intro_dismiss' );
					return savePreference( 'is_new_reader', false );
				},
				handleManageLinkClick: () => {
					recordTrack( 'calypso_reader_following_intro_link_clicked' );
					return savePreference( 'is_new_reader', false );
				},
			},
			dispatch
		)
)( localize( FollowingIntro ) );
