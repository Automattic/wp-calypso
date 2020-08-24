/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import PostScheduler from './post-scheduler';
import * as utils from 'state/posts/utils';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class EditorPublishDate extends React.Component {
	static propTypes = {
		post: PropTypes.object,
		setPostDate: PropTypes.func,
	};

	state = {
		isOpen: false,
	};

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

	handleOutsideClick = ( event ) => {
		// The `className` of a `svg` element is a `SVGAnimatedString`, which
		// does not have a `split` method.  Since an `svg` element will not
		// have any of the classes we're interested in, don't bother trying to
		// handle this situation.
		const targetClasses =
			typeof event.target.className === 'string' ? event.target.className.split( /\s/ ) : [];

		const hasDatePickerDayClass =
			intersection( targetClasses, [ 'DayPicker-Day', 'date-picker__day' ] ).length > 0;

		const isChildOfPublishDate = ReactDom.findDOMNode(
			this.refs.editorPublishDateWrapper
		).contains( event.target );

		if ( ! hasDatePickerDayClass && ! isChildOfPublishDate ) {
			this.setState( { isOpen: false } );
		}
	};

	setImmediate = () => {
		this.props.setPostDate( false );
		this.setState( { isOpen: false } );
	};

	toggleOpenState = () => {
		this.setState( { isOpen: ! this.state.isOpen } );
	};

	getHeaderDescription() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );
		const isPublished = utils.isPublished( this.props.post );

		if ( isPublished && isScheduled ) {
			return this.props.translate( 'Scheduled' );
		}

		if ( isScheduled ) {
			return this.props.translate( 'Schedule' );
		}

		if ( isPublished ) {
			return this.props.translate( 'Published' );
		}

		if ( isBackDated ) {
			return this.props.translate( 'Backdate' );
		}

		return this.props.translate( 'Publish Immediately' );
	}

	renderCalendarHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );
		const isPublished = utils.isPublished( this.props.post );

		if ( isPublished ) {
			return;
		}

		if ( ! isScheduled && ! isBackDated ) {
			return (
				<div className="editor-publish-date__choose-header">
					{ this.props.translate( 'Choose a date to schedule' ) }
				</div>
			);
		}

		return (
			<Button
				borderless={ true }
				className="editor-publish-date__immediate"
				onClick={ this.setImmediate }
			>
				{ this.props.translate( 'Cancel scheduling' ) }
			</Button>
		);
	}

	renderHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );
		const isPublished = utils.isPublished( this.props.post );
		const className = classNames( 'editor-publish-date__header', {
			'is-scheduled': isScheduled,
			'is-back-dated': isBackDated,
			'is-published': isPublished,
		} );
		const selectedDay = this.props.post && this.props.post.date ? this.props.post.date : null;

		return (
			<div className={ className } onClick={ this.toggleOpenState }>
				<Gridicon className="editor-publish-date__header-icon" icon="calendar" size={ 18 } />
				<div className="editor-publish-date__header-wrapper">
					<div className="editor-publish-date__header-description">
						{ this.getHeaderDescription() }
					</div>
					{ ( isScheduled || isBackDated || isPublished ) && (
						<div className="editor-publish-date__header-chrono">
							{ this.props.moment( selectedDay ).calendar() }
						</div>
					) }
				</div>
				<Gridicon className="editor-publish-date__header-chevron" icon="chevron-down" size={ 18 } />
			</div>
		);
	}

	renderSchedule() {
		const selectedDay = this.props.post && this.props.post.date ? this.props.post.date : null;

		const isScheduled = utils.isFutureDated( this.props.post );
		const className = classNames( 'editor-publish-date__schedule', {
			'is-scheduled': isScheduled,
		} );

		return (
			<div className={ className }>
				{ this.renderCalendarHeader() }
				<PostScheduler
					post={ this.props.post }
					site={ this.props.site }
					initialDate={ this.props.moment() }
					setPostDate={ this.props.setPostDate }
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

export default connect( ( state ) => {
	return {
		site: getSelectedSite( state ),
	};
} )( localize( withLocalizedMoment( EditorPublishDate ) ) );
