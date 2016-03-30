/**
 * External dependencies
 */
import React from 'react';
import striptags from 'striptags';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'voiceReadButton',

	propTypes: {
		tagName: React.PropTypes.string,
		post: React.PropTypes.object,
	},

	getDefaultProps() {
		return {
			tagName: 'li',
			size: 24
		};
	},

	getInitialState: function() {
		return {
			lines: [],
			isPaused: false,
			isPlaying: false,
			currentUtterance: null
		};
	},

	onClick( event ) {
		event.preventDefault();
	},

	onTap() {
		this.readOut();
	},

	setLines: function( cb ) {
		let sentences = this.props.post.content.split( /\n|\.\s/g );
		let normalizedSentences = [ striptags( this.props.post.title ) ];
		sentences.forEach( sentence => {
			sentence = striptags( sentence );
			sentence = sentence.replace( /&nbsp;/g, ' ' );
			let words = sentence.split( ' ' );
			if ( words.length > 40 ) {
				normalizedSentences.push( words.slice( 0, 39 ) .join( ' ' ) );
				normalizedSentences.push( words.slice( 39, words.length - 1 ).join( ' ' ) );
			} else {
				normalizedSentences.push( sentence );
			}
		} );

		this.setState( { lines: normalizedSentences }, cb );
	},

	isReadingThis() {
		return window.speechSynthesis.utterance === this.state.currentUtterance;
	},

	readOut() {
		if ( this.state.isPaused ) {
			this.setState( { isPaused: false, isPlaying: true }, () => {
				if ( this.isReadingThis() ) {
					window.speechSynthesis.resume();
				} else {
					window.speechSynthesis.cancel();
					this.startReading();
				}
			} );
		} else if ( this.state.isPlaying ) {
			window.speechSynthesis.pause();
			this.setState( { isPaused: true, isPlaying: false } );
		} else {
			window.speechSynthesis.cancel();
			this.setState( { isPlaying: true } );
			this.setLines(
				this.startReading
			);
		}
	},

	readLine( line, cb ) {
		let utterance = new SpeechSynthesisUtterance( line );
		let voices = window.speechSynthesis.getVoices();
		this.setState( { currentUtterance: utterance } );
		utterance.voice = voices.filter( function( voice ) {
			return voice.name === 'Alex';
		} )[ 0 ];
		utterance.lang = 'en';
		utterance.rate = 0.9;
		utterance.onend = cb;
		window.speechSynthesis.speak( utterance );
		window.speechSynthesis.utterance = utterance;
	},

	startReading() {
		this.readLines();
	},

	readLines() {
		if ( this.state.isPaused ) {
			return;
		}
		if ( this.state.lines.length ) {
			this.readLine( this.state.lines.shift(), this.readLines );
		} else {
			this.setState( { isPlaying: false } );
		}
	},

	getIcon() {
		if ( this.state.isPlaying ) {
			return <span className="voice-read-button__icon voice-read-button__icon_unicode">⏸</span>
		}
		if ( this.state.isPaused ) {
			return <span className="voice-read-button__icon voice-read-button__icon_unicode">▶</span>
		}
		return <Gridicon icon="microphone" size={ this.props.size } className="voice-read-button__icon" />;
	},

	render() {
		const containerTag = this.props.tagName;
		const labelElement = ( <span className="voice-read-button__label">
			<span className="voice-read-button__label-status">{ this.translate( 'Voice Read' ) }</span>
		</span> );

		return React.createElement(
			containerTag, {
				className: 'voice-read-button',
				onTouchTap: this.onTap,
				onClick: this.onClick
			},
			this.getIcon(), labelElement
		);
	}
} );
