import { Component } from 'react';
import { connect } from 'react-redux';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import Main from 'calypso/components/main';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import setUserSetting from 'calypso/state/user-settings/thunks/set-user-setting';
import { ReaderPendingActionHandler } from './pending-action-handler';
import './style.scss';

/*
 * We ref-count number of ReaderMains on screen in order to avoid a race condition
 *
 * If two pages in a row have a ReaderMain there is no guarantee as to the order of dismounting
 * and mounting. If we naively toggled the readerPage within willMount and willDismount
 * we could run into a weird state.
 *
 * A problem sequence would be:
 * 1. land on reader (mount, 1 ref)
 * 2. navigate to another reader page (mount new ReaderMain, 2 ref)
 * 3. dismount old ReaderMain from the first step (dismount, 1 ref)
 */
let activeReaderMainRefCount = 0;
let survicateScriptLoaded = false;

const setIsReaderPage = ( add ) => {
	if ( add ) {
		document.querySelector( 'body' ).classList.add( 'is-reader-page' );
	} else if ( activeReaderMainRefCount === 0 ) {
		document.querySelector( 'body' ).classList.remove( 'is-reader-page' );
	}
};

const loadSurvicateScript = ( userId, hasCompletedSurvey, onSurveyCompleted ) => {
	if ( survicateScriptLoaded || typeof window === 'undefined' ) {
		return;
	}

	// Don't load script if user has already completed a survey
	if ( hasCompletedSurvey ) {
		return;
	}

	try {
		// Define user IDs before the init of the tracking code
		if ( userId ) {
			( function ( opts ) {
				opts.traits = {
					user_id: userId.toString(),
				};
			} )( ( window._sva = window._sva || {} ) );
		}

		const script = document.createElement( 'script' );
		script.src =
			'https://survey.survicate.com/workspaces/e4794374cce15378101b63de24117572/web_surveys.js';
		script.async = true;

		// Set up event listener once script loads
		script.onload = () => {
			if ( window._sva && typeof window._sva.addEventListener === 'function' ) {
				// Listen for survey completion
				window._sva.addEventListener( 'survey_completed', ( surveyId ) => {
					// Call the callback to save user preference
					onSurveyCompleted( surveyId );
				} );
			}
		};

		const firstScript = document.getElementsByTagName( 'script' )[ 0 ];
		if ( firstScript && firstScript.parentNode ) {
			firstScript.parentNode.insertBefore( script, firstScript );
			survicateScriptLoaded = true;
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( 'Failed to load Survicate script:', error );
	}
};

/**
 * A specialization of `Main` that adds a class to the body of the document
 *
 * This class is used by pieces of the Reader to indicate they want "editorial" styles.
 * Notably, this overrides the background color of the document and is used as a hook by other parts to override styles.
 */
class ReaderMain extends Component {
	// eslint-disable-next-line no-unused-vars
	handleSurveyCompleted = ( surveyId ) => {
		const { dispatch } = this.props;

		// Set user preference to indicate they've completed a poll
		dispatch( setUserSetting( 'reader_poll_completed', true ) );

		// Save the settings immediately
		dispatch( saveUserSettings() );
	};

	componentDidMount() {
		activeReaderMainRefCount++;
		setIsReaderPage( true );
		loadSurvicateScript(
			this.props.userId,
			this.props.hasCompletedSurvey,
			this.handleSurveyCompleted
		);
	}

	componentWillUnmount() {
		activeReaderMainRefCount--;
		setIsReaderPage( false );
	}

	render() {
		const { children, forwardRef, ...props } = this.props;
		return (
			<div ref={ forwardRef }>
				<Main { ...props }>
					<SyncReaderFollows key="syncReaderFollows" />
					<ReaderPendingActionHandler />
					{ children }
				</Main>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		userId: getCurrentUserId( state ),
		hasCompletedSurvey: getUserSetting( state, 'reader_poll_completed' ) === true,
	} ),
	{ setUserSetting, saveUserSettings }
)( ReaderMain );
