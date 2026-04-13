import { useState, useEffect } from 'preact/hooks';
import { getStoredToken, login, removeToken } from './api/auth';
import { fetchFreshlyPressed, fetchFollowing, getCachedPosts } from './api/freshly-pressed';
import { Loading } from './components/loading';
import { LoginScreen } from './components/login-screen';
import { PostFeed } from './components/post-feed';

export function App() {
	const [ token, setToken ] = useState( null );
	const [ authChecked, setAuthChecked ] = useState( false );
	const [ posts, setPosts ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ showFreshlyPressed, setShowFreshlyPressed ] = useState( false );

	useEffect( () => {
		getStoredToken().then( ( storedToken ) => {
			if ( storedToken ) {
				setToken( storedToken );
				const cached = getCachedPosts( true );
				if ( cached ) {
					setPosts( cached );
					setLoading( false );
				}
			}
			setAuthChecked( true );
		} );
	}, [] );

	useEffect( () => {
		if ( ! authChecked ) {
			return;
		}

		if ( token ) {
			fetchFollowing( token )
				.then( ( freshPosts ) => {
					setPosts( freshPosts );
					setLoading( false );
					setError( null );
				} )
				.catch( ( err ) => {
					if ( err.message === 'auth_expired' ) {
						removeToken();
						setToken( null );
						return;
					}
					if ( posts.length === 0 ) {
						setError( err.message );
						setLoading( false );
					}
				} );
		} else if ( showFreshlyPressed ) {
			loadFreshlyPressed();
		} else {
			setLoading( false );
		}
	}, [ token, authChecked, showFreshlyPressed ] );

	function loadFreshlyPressed() {
		setLoading( true );
		const cached = getCachedPosts( false );
		if ( cached ) {
			setPosts( cached );
			setLoading( false );
		}
		fetchFreshlyPressed()
			.then( ( freshPosts ) => {
				setPosts( freshPosts );
				setLoading( false );
				setError( null );
			} )
			.catch( ( err ) => {
				if ( posts.length === 0 ) {
					setError( err.message );
					setLoading( false );
				}
			} );
	}

	function handleLogin() {
		login()
			.then( ( accessToken ) => {
				setToken( accessToken );
				setLoading( true );
				setShowFreshlyPressed( false );
			} )
			.catch( ( err ) => {
				setError( err.message );
			} );
	}

	function handleSkipToFreshlyPressed() {
		setShowFreshlyPressed( true );
	}

	function handleRetry() {
		setError( null );
		setLoading( true );
		if ( token ) {
			fetchFollowing( token )
				.then( ( freshPosts ) => {
					setPosts( freshPosts );
					setLoading( false );
				} )
				.catch( ( err ) => {
					setError( err.message );
					setLoading( false );
				} );
		} else {
			loadFreshlyPressed();
		}
	}

	if ( ! authChecked ) {
		return (
			<div class="app">
				<main class="app__content">
					<Loading title="Loading..." />
				</main>
			</div>
		);
	}

	if ( ! token && ! showFreshlyPressed ) {
		return (
			<div class="app">
				<main class="app__content">
					<LoginScreen onLogin={ handleLogin } onSkip={ handleSkipToFreshlyPressed } />
				</main>
			</div>
		);
	}

	const feedTitle = token ? 'Following' : 'WordPress.com Freshly Pressed Posts';

	return (
		<div class="app">
			<main class="app__content">
				{ error && (
					<div class="error">
						<p>Failed to load posts: { error }</p>
						<button onClick={ handleRetry }>Try again</button>
					</div>
				) }
				{ loading && <Loading title={ feedTitle } /> }
				{ ! loading && ! error && <PostFeed posts={ posts } title={ feedTitle } /> }
			</main>
		</div>
	);
}
