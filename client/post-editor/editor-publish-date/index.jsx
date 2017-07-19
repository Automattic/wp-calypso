/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';

export class EditorPublishDate extends React.Component {

	static propTypes = {
		postDate: React.PropTypes.string,
		setPostDate: React.PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			open: false,
		};
	}

	toggleOpenState = () => {
		this.setState( { open: ! this.state.open } );
	}

	renderHeader() {
		const className = classNames( 'editor-publish-date__header', { 'is-open': this.state.open } );

		return (
			<div className={ className } onClick={ this.toggleOpenState }>
				<Gridicon icon="calendar" size={ 18 } /> { this.props.translate( 'Publish Immediately' ) }
			</div>
		);
	}

	renderSchedule() {
		const className = classNames( 'editor-publish-date__schedule', {} );
		const selectedDay = this.props.postDate ? this.props.moment( this.props.postDate ) : null;

		return (
			<div className={ className }>
				<PostSchedule
					displayInputChrono={ false }
					onDateChange={ this.props.setPostDate }
					selectedDay={ selectedDay }
					/>
			</div>
		);
	}

	render() {
		return (
			<div className="editor-publish-date">
				<div className="editor-publish-date__wrapper">
					{ this.renderHeader() }
					{ this.state.open && this.renderSchedule() }
				</div>
			</div>
		);
	}

}

export default localize( EditorPublishDate );
