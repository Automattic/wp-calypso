/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

/**
 * Asset dependencies
 */
import charactersImage from 'calypso/assets/images/reader/reader-conversations-characters.svg';

/**
 * Style dependencies
 */
import './intro.scss';

const getPreferenceName = ( isInternal ) =>
	isInternal ? 'has_used_reader_conversations_a8c' : 'has_used_reader_conversations';

class ConversationsIntro extends React.Component {
	static propTypes = {
		isInternal: PropTypes.bool,
	};

	static defaultProps = {
		isInternal: false,
	};

	componentDidMount() {
		this.maybeRecordRenderTrack();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.hasUsedConversations !== prevProps.hasUsedConversations ||
			this.props.isInternal !== prevProps.isInternal
		) {
			this.maybeRecordRenderTrack();
		}
	}

	maybeRecordRenderTrack = ( props = this.props ) => {
		if ( props.hasUsedConversations !== true ) {
			this.props.recordReaderTracksEvent( 'calypso_reader_conversations_intro_render' );
		}
	};

	dismiss = () => {
		this.props.recordReaderTracksEvent( 'calypso_reader_conversations_intro_dismiss' );
		this.props.dismiss( this.props.isInternal );
	};

	render() {
		const { hasUsedConversations, translate, isInternal } = this.props;

		if ( hasUsedConversations ) {
			return null;
		}

		return (
			<header className="conversations__intro">
				<QueryPreferences />
				<div className="conversations__intro-header">
					<div className="conversations__intro-copy">
						<span>
							{ isInternal
								? translate(
										'{{strong}}Welcome to A8C Conversations{{/strong}}, where you can read ' +
											'and reply to all your P2 conversations in one place. ' +
											"Automattic P2 posts you've liked or commented on " +
											'will appear when they have new comments. ' +
											'{{a}}More info. {{/a}}',
										{
											components: {
												strong: <strong />,
												a: <a href="http://wp.me/p5PDj3-44u" />,
											},
										}
								  )
								: translate(
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
					<img className="conversations__intro-character" src={ charactersImage } alt="" />

					<button
						className="conversations__intro-close"
						onClick={ this.dismiss }
						title={ translate( 'Close' ) }
						aria-label={ translate( 'Close' ) }
					>
						<Gridicon
							icon="cross-circle"
							className="conversations__intro-close-icon"
							title={ translate( 'Close' ) }
						/>
					</button>
				</div>
			</header>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const preferenceName = getPreferenceName( ownProps.isInternal );
		return {
			hasUsedConversations: getPreference( state, preferenceName ),
		};
	},
	{
		dismiss: ( isInternal ) => {
			const preferenceName = getPreferenceName( isInternal );
			return savePreference( preferenceName, true );
		},
		recordReaderTracksEvent,
	}
)( localize( ConversationsIntro ) );
