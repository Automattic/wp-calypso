/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { recordTrack } from 'reader/stats';
import { isUserNewerThan, WEEK_IN_MILLISECONDS } from 'state/ui/guided-tours/contexts';
import cssSafeUrl from 'lib/css-safe-url';

/**
 * Image dependencies
 */
import readerImage from 'assets/images/reader/reader-intro-character.svg';
import readerBackground from 'assets/images/reader/reader-intro-background.svg';

class FollowingIntro extends React.Component {
	componentDidMount() {
		this.recordRenderTrack();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.isNewReader !== prevProps.isNewReader ) {
			this.recordRenderTrack();
		}
	}

	recordRenderTrack = ( props = this.props ) => {
		if ( props.isNewReader === true ) {
			recordTrack( 'calypso_reader_following_intro_render' );
		}
	};

	render() {
		const { isNewReader, translate, dismiss, isNewUser } = this.props;

		if ( ! isNewReader || ! isNewUser ) {
			return null;
		}

		const linkElement = <a onClick={ this.props.handleManageLinkClick } href="/following/manage" />;

		return (
			<header
				className="following__intro"
				style={ { backgroundImage: 'url(' + cssSafeUrl( readerBackground ) + ')' } }
			>
				<QueryPreferences />
				<div className="following__intro-header">
					<div className="following__intro-copy">
						<span>
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
						</span>
					</div>
					<img className="following__intro-character" src={ readerImage } alt="" />

					<button
						className="following__intro-close"
						onClick={ dismiss }
						title={ translate( 'Close' ) }
						aria-label={ translate( 'Close' ) }
					>
						<Gridicon
							icon="cross-circle"
							className="following__intro-close-icon"
							title={ translate( 'Close' ) }
						/>
						<span className="following__intro-close-icon-bg" />
					</button>
				</div>
			</header>
		);
	}
}

export default connect(
	( state ) => {
		return {
			isNewReader: getPreference( state, 'is_new_reader' ),
			isNewUser: isUserNewerThan( WEEK_IN_MILLISECONDS * 2 )( state ),
		};
	},
	( dispatch ) =>
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
