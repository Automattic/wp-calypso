import { useState, useEffect, useCallback } from 'preact/hooks';
import { getStoredToken, login, removeToken } from './api/auth';
import { fetchFollowing, fetchMe, getCachedPosts } from './api/freshly-pressed';
import { Header } from './components/header';
import { Loading } from './components/loading';
import { LoginScreen } from './components/login-screen';
import { PostFeed } from './components/post-feed';

export function App() {
	const [ token, setToken ] = useState( null );
	const [ authChecked, setAuthChecked ] = useState( false );
	const [ posts, setPosts ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ loadingMore, setLoadingMore ] = useState( false );
	const [ hasMore, setHasMore ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ avatarUrl, setAvatarUrl ] = useState( null );
	const [ layout, setLayout ] = useState( () => localStorage.getItem( 'reader_layout' ) || 'grid' );

	const handleLayoutChange = ( newLayout ) => {
		setLayout( newLayout );
		localStorage.setItem( 'reader_layout', newLayout );
	};

	useEffect( () => {
		getStoredToken().then( ( storedToken ) => {
			if ( storedToken ) {
				setToken( storedToken );
				const cached = getCachedPosts();
				if ( cached ) {
					setPosts( cached );
					setLoading( false );
				}
			}
			setAuthChecked( true );
		} );
	}, [] );

	useEffect( () => {
		if ( token ) {
			fetchMe( token )
				.then( ( me ) => setAvatarUrl( me.avatar_URL || null ) )
				.catch( () => {} );
		} else {
			setAvatarUrl( null );
		}
	}, [ token ] );

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
					setHasMore( freshPosts.length >= 20 );
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
		} else {
			setLoading( false );
		}
	}, [ token, authChecked ] );

	const handleLoadMore = useCallback( () => {
		if ( loadingMore || ! hasMore || posts.length === 0 || ! token ) {
			return;
		}

		setLoadingMore( true );
		const lastPost = posts[ posts.length - 1 ];
		const before = lastPost.date;

		fetchFollowing( token, before )
			.then( ( morePosts ) => {
				setPosts( ( prev ) => [ ...prev, ...morePosts ] );
				setHasMore( morePosts.length >= 20 );
				setLoadingMore( false );
			} )
			.catch( () => {
				setLoadingMore( false );
			} );
	}, [ loadingMore, hasMore, posts, token ] );

	function handleLogin() {
		login()
			.then( ( accessToken ) => {
				setToken( accessToken );
				setLoading( true );
			} )
			.catch( ( err ) => {
				setError( err.message );
			} );
	}

	function handleRetry() {
		setError( null );
		setLoading( true );
		if ( token ) {
			fetchFollowing( token )
				.then( ( freshPosts ) => {
					setPosts( freshPosts );
					setLoading( false );
					setHasMore( freshPosts.length >= 20 );
				} )
				.catch( ( err ) => {
					setError( err.message );
					setLoading( false );
				} );
		}
	}

	if ( ! authChecked ) {
		return (
			<div class="app">
				<Header token={ null } avatarUrl={ null } onLogin={ handleLogin } />
				<main class="app__content">
					<Loading title="Loading..." />
				</main>
			</div>
		);
	}

	if ( ! token ) {
		return (
			<div class="app">
				<Header token={ null } avatarUrl={ null } onLogin={ handleLogin } />
				<main class="app__content">
					<LoginScreen onLogin={ handleLogin } />
				</main>
			</div>
		);
	}

	const feedTitle = 'Recent';
	const feedSubtitle = 'Latest from your subscriptions.';

	return (
		<div class="app">
			<Header token={ token } avatarUrl={ avatarUrl } onLogin={ handleLogin } />
			<main class="app__content">
				{ error && (
					<div class="error">
						<p>Failed to load posts: { error }</p>
						<button onClick={ handleRetry }>Try again</button>
					</div>
				) }
				{ loading && <Loading title={ feedTitle } /> }
				{ ! loading && ! error && (
					<PostFeed
						posts={ posts }
						title={ feedTitle }
						subtitle={ feedSubtitle }
						onLoadMore={ handleLoadMore }
						loadingMore={ loadingMore }
						hasMore={ hasMore }
						layout={ layout }
						onLayoutChange={ handleLayoutChange }
					/>
				) }
			</main>
		</div>
	);
}
