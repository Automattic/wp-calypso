import { useState, useEffect } from 'preact/hooks';
import { fetchFreshlyPressed, getCachedPosts } from './api/freshly-pressed';
import { Header } from './components/header';
import { Loading } from './components/loading';
import { PostFeed } from './components/post-feed';
import { Sidebar } from './components/sidebar';

export function App() {
	const [ posts, setPosts ] = useState( () => getCachedPosts() || [] );
	const [ loading, setLoading ] = useState( ! getCachedPosts() );
	const [ error, setError ] = useState( null );

	useEffect( () => {
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
	}, [] );

	function handleRetry() {
		setError( null );
		setLoading( true );
		fetchFreshlyPressed()
			.then( ( freshPosts ) => {
				setPosts( freshPosts );
				setLoading( false );
			} )
			.catch( ( err ) => {
				setError( err.message );
				setLoading( false );
			} );
	}

	return (
		<div class="app">
			<Header />
			<div class="app__body">
				<Sidebar />
				<main class="app__content">
					{ error && (
						<div class="error">
							<p>Failed to load posts: { error }</p>
							<button onClick={ handleRetry }>Try again</button>
						</div>
					) }
					{ loading && <Loading /> }
					{ ! loading && ! error && <PostFeed posts={ posts } /> }
				</main>
			</div>
		</div>
	);
}
