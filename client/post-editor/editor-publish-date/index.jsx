/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PostSchedule from 'components/post-schedule';
import utils from 'lib/posts/utils';

export class EditorPublishDate extends React.Component {

	static propTypes = {
		post: React.PropTypes.object,
		postDate: React.PropTypes.string,
		setPostDate: React.PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false,
		};
	}

	componentWillUnmount() {
		window.removeEventListener( 'click', this.handleOutsideClick );
	}

	componentDidUpdate() {
		if ( this.state.isOpen ) {
			window.addEventListener( 'click', this.handleOutsideClick );
		} else {
			window.removeEventListener( 'click', this.handleOutsideClick );
		}
	}

	handleOutsideClick = event => {
		if ( ! ReactDom.findDOMNode( this.refs.editorPublishDateWrapper ).contains( event.target ) ) {
			this.setState( { isOpen: false } );
		}
	}

	setImmediate = () => {
		this.props.setPostDate( this.props.moment() );
		this.setState( { isOpen: false } );
	}

	toggleOpenState = () => {
		this.setState( { isOpen: ! this.state.isOpen } );
	}

	renderHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const className = classNames( 'editor-publish-date__header', {
			'is-scheduled': isScheduled,
		} );

		return (
			<div className={ className } onClick={ this.toggleOpenState }>
				<Gridicon icon="calendar" size={ 18 } />
				<div className="editor-publish-date__header-wrapper">
					<div className="editor-publish-date__header-description">
						{
							isScheduled
							? this.props.translate( 'Scheduled' )
							: this.props.translate( 'Publish Immediately' )
						}
					</div>
					{ isScheduled && (
						<div className="editor-publish-date__header-chrono">
							{ this.props.moment( this.props.postDate ).calendar() }
						</div>
					) }
				</div>
			</div>
		);
	}

	renderSchedule() {
		const selectedDay = this.props.postDate ? this.props.moment( this.props.postDate ) : null;

		return (
			<div className="editor-publish-date__schedule">
				<Button borderless={ true } className="editor-publish-date__immediate" onClick={ this.setImmediate }>
					{ this.props.translate( 'Publish Immediately' ) }
				</Button>
				<PostSchedule
					displayInputChrono={ false }
					onDateChange={ this.props.setPostDate }
					selectedDay={ selectedDay }
					/>
			</div>
		);
	}

	render() {
		const className = classNames( 'editor-publish-date', {
			'is-open': this.state.isOpen,
		} );

		return (
			<div className={ className }>
				<div className="editor-publish-date__wrapper" ref="editorPublishDateWrapper">
					{ this.renderHeader() }
					{ this.state.isOpen && this.renderSchedule() }
				</div>
			</div>
		);
	}

}

export default localize( EditorPublishDate );
