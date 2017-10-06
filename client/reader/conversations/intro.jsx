/** @format */
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

class ConversationsIntro extends React.Component {
	componentDidMount() {
		this.recordRenderTrack();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.hasUsedConversations !== nextProps.hasUsedConversations ) {
			this.recordRenderTrack( nextProps );
		}
	}

	recordRenderTrack = ( props = this.props ) => {
		if ( props.hasUsedConversations !== true ) {
			recordTrack( 'calypso_reader_conversations_intro_render' );
		}
	};

	render() {
		const { hasUsedConversations, translate, dismiss } = this.props;

		if ( hasUsedConversations ) {
			return null;
		}

		return (
			<header className="conversations__intro">
				<QueryPreferences />
				<div className="conversations__intro-header">
					<div className="conversations__intro-copy">
						<span>
							{ translate(
								'{{strong}}Welcome to Conversations.{{/strong}} You can read ' +
									'and reply to all your conversations in one place. ' +
									"WordPress posts you've liked or commented on " +
									'will appear when they have new comments.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</span>
					</div>
					<div className="conversations__intro-character" />

					<div
						className="conversations__intro-close"
						onClick={ dismiss }
						title={ translate( 'Close' ) }
						role="button"
						aria-label={ translate( 'Close' ) }
					>
						<Gridicon
							icon="cross-circle"
							className="conversations__intro-close-icon"
							title={ translate( 'Close' ) }
						/>
						<span className="conversations__intro-close-icon-bg" />
					</div>
				</div>
			</header>
		);
	}
}

export default connect(
	state => {
		return {
			hasUsedConversations: getPreference( state, 'has_used_reader_conversations' ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				dismiss: () => {
					recordTrack( 'calypso_reader_conversations_intro_dismiss' );
					return savePreference( 'has_used_reader_conversations', true );
				},
			},
			dispatch
		)
)( localize( ConversationsIntro ) );
