import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

interface Message {
	role: 'user' | 'assistant' | 'error';
	content: string;
}

function getRoleLabel( role: Message[ 'role' ] ): string {
	switch ( role ) {
		case 'user':
			return 'You';
		case 'assistant':
			return 'Claude';
		default:
			return 'Error';
	}
}

export default function VertoMain() {
	const [ messages, setMessages ] = useState< Message[] >( [] );
	const [ input, setInput ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ sessionId, setSessionId ] = useState< string | null >( () => {
		const hash = window.location.hash.replace( /^#/, '' );
		return hash || null;
	} );
	const messagesEndRef = useRef< HTMLDivElement | null >( null );
	const inputRef = useRef< HTMLTextAreaElement | null >( null );
	const abortRef = useRef< AbortController | null >( null );

	const scrollToBottom = useCallback( () => {
		messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
	}, [] );

	useEffect( () => {
		scrollToBottom();
	}, [ messages, scrollToBottom ] );

	const sendPrompt = useCallback(
		async ( prompt: string ) => {
			setMessages( ( prev ) => [ ...prev, { role: 'user', content: prompt } ] );
			setInput( '' );
			setLoading( true );

			const controller = new AbortController();
			abortRef.current = controller;

			try {
				const res = await fetch( '/api/verto/prompt', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify( { prompt, sessionId } ),
					signal: controller.signal,
				} );

				const data = await res.json();

				if ( ! res.ok ) {
					setMessages( ( prev ) => [
						...prev,
						{ role: 'error', content: data.error || `HTTP ${ res.status }` },
					] );
					return;
				}

				if ( data.session_id && data.session_id !== sessionId ) {
					setSessionId( data.session_id );
					window.history.replaceState( null, '', `#${ data.session_id }` );
				}

				const text = data.result ?? JSON.stringify( data, null, 2 );
				setMessages( ( prev ) => [ ...prev, { role: 'assistant', content: text } ] );
			} catch ( err: unknown ) {
				if ( err instanceof Error && err.name === 'AbortError' ) {
					setMessages( ( prev ) => [ ...prev, { role: 'error', content: 'Request cancelled.' } ] );
				} else {
					const msg = err instanceof Error ? err.message : String( err );
					setMessages( ( prev ) => [ ...prev, { role: 'error', content: msg } ] );
				}
			} finally {
				setLoading( false );
				abortRef.current = null;
			}
		},
		[ sessionId ]
	);

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();
			const trimmed = input.trim();
			if ( ! trimmed || loading ) {
				return;
			}
			sendPrompt( trimmed );
		},
		[ input, loading, sendPrompt ]
	);

	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
			if ( e.key === 'Enter' && ! e.shiftKey ) {
				e.preventDefault();
				handleSubmit( e );
			}
		},
		[ handleSubmit ]
	);

	const handleStop = useCallback( () => {
		abortRef.current?.abort();
	}, [] );

	return (
		<div className="verto-page">
			<PageViewTracker path="/verto" title="Calypso Agentic Framework" />
			<div className="verto-page__window">
				<iframe className="verto-page__iframe" src="/" title="Calypso" />
			</div>
			<aside className="verto-page__chat">
				<div className="verto-page__chat-header">
					<h2 className="verto-page__chat-title">Claude</h2>
					{ sessionId && (
						<span className="verto-page__chat-session">{ sessionId.slice( 0, 8 ) }</span>
					) }
				</div>
				<div className="verto-page__chat-messages">
					{ messages.map( ( msg, i ) => (
						<div key={ i } className={ `verto-page__chat-msg is-${ msg.role }` }>
							<div className="verto-page__chat-msg-role">{ getRoleLabel( msg.role ) }</div>
							{ msg.role === 'assistant' ? (
								<div className="verto-page__chat-msg-content is-markdown">
									<ReactMarkdown>{ msg.content }</ReactMarkdown>
								</div>
							) : (
								<pre className="verto-page__chat-msg-content">{ msg.content }</pre>
							) }
						</div>
					) ) }
					{ loading && (
						<div className="verto-page__chat-msg is-assistant is-loading">
							<div className="verto-page__chat-msg-role">Claude</div>
							<div className="verto-page__chat-typing">
								<span />
								<span />
								<span />
							</div>
						</div>
					) }
					<div ref={ messagesEndRef } />
				</div>
				<form className="verto-page__chat-input-area" onSubmit={ handleSubmit }>
					<textarea
						ref={ inputRef }
						className="verto-page__chat-input"
						value={ input }
						onChange={ ( e ) => setInput( e.target.value ) }
						onKeyDown={ handleKeyDown }
						placeholder="Ask Claude..."
						rows={ 2 }
						disabled={ loading }
					/>
					{ loading ? (
						<button type="button" className="verto-page__chat-btn is-stop" onClick={ handleStop }>
							Stop
						</button>
					) : (
						<button type="submit" className="verto-page__chat-btn" disabled={ ! input.trim() }>
							Send
						</button>
					) }
				</form>
			</aside>
		</div>
	);
}
