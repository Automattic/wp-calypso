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
			open: false,
		};
	}

	toggleOpenState = () => {
		this.setState( { open: ! this.state.open } );
	}

	renderHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const className = classNames( 'editor-publish-date__header', {
			'is-open': this.state.open,
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
